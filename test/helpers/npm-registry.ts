import Docker from "dockerode";
import { execa } from "execa";
import getStream from "get-stream";
import got from "got";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pRetry from "p-retry";

const IMAGE = "verdaccio/verdaccio:4";
const REGISTRY_PORT = 4873;
const REGISTRY_HOST = "localhost";
const NPM_USERNAME = "integration";
const NPM_PASSWORD = "suchsecure";
const NPM_EMAIL = "integration@test.com";
const docker = new Docker();
let container: Docker.Container;

export const url = `http://${REGISTRY_HOST}:${REGISTRY_PORT}/`;

export const authEnv = {
  YARN_UNSAFE_HTTP_WHITELIST: REGISTRY_HOST,
  YARN_NPM_PUBLISH_REGISTRY: url,
  YARN_NPM_AUTH_TOKEN: undefined,
};

/**
 * Download the `npm-registry-docker` Docker image, create a new container and start it.
 */
export async function start() {
  await getStream(await docker.pull(IMAGE));

  container = await docker.createContainer({
    Tty: true,
    Image: IMAGE,
    HostConfig: {
      PortBindings: {
        [`${REGISTRY_PORT}/tcp`]: [{ HostPort: `${REGISTRY_PORT}` }],
      },
    },
  });

  await execa("docker", [
    "cp",
    resolve(dirname(fileURLToPath(import.meta.url)), "config.yaml"),
    `${container.id}:/verdaccio/conf/config.yaml`,
  ]);

  await container.start();

  try {
    // Wait for the registry to be ready
    await pRetry(
      () => got(`http://${REGISTRY_HOST}:${REGISTRY_PORT}/`, { cache: false }),
      {
        retries: 7,
        minTimeout: 1000,
        factor: 2,
      }
    );
  } catch {
    throw new Error(`Couldn't start ${IMAGE} after 2 min`);
  }

  // Create user
  const response = await got
    .put(
      `http://${REGISTRY_HOST}:${REGISTRY_PORT}/-/user/org.couchdb.user:${NPM_USERNAME}`,
      {
        json: {
          _id: `org.couchdb.user:${NPM_USERNAME}`,
          name: NPM_USERNAME,
          roles: [],
          type: "user",
          password: NPM_PASSWORD,
          email: NPM_EMAIL,
        },
      }
    )
    .json();

  // Store token
  authEnv.YARN_NPM_AUTH_TOKEN = (response as any).token;
}

/**
 * Stop and remote the `npm-registry-docker` Docker container.
 */
export async function stop() {
  await container.stop();
  await container.remove();
}
