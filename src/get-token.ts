// @ts-ignore
import toNerfDart from "nerf-dart";
import { YARNRC_FILENAME } from "./definitions/constants.js";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export function getToken(
  registry: string,
  { npmRegistries, npmAuthToken }: Yarnrc,
  {
    env,
    logger,
  }: { env: CommonContext["env"]; logger: CommonContext["logger"] },
) {
  const registryId = toNerfDart(registry);

  // @todo implement yarnrc.npmScopes

  // Lookup in yarnrc.npmRegistries
  // @todo - Verify this does in fact override an auth token set in env var
  const entry =
    npmRegistries &&
    Object.entries(npmRegistries).find(([id, { npmAuthToken }]) => {
      return toNerfDart(id) === registryId && npmAuthToken;
    });
  if (entry) {
    logger.log(
      `Using token from "${YARNRC_FILENAME}: npmRegistries["${entry[0]}"].npmAuthToken"`,
    );

    return npmRegistries[entry[0]]!.npmAuthToken!;
  }

  // Return env var if set
  if (env["YARN_NPM_AUTH_TOKEN"]) {
    logger.log(`Using token from environment variable YARN_NPM_AUTH_TOKEN`);

    return env["YARN_NPM_AUTH_TOKEN"];
  }

  // Return yarnrc.npmAuthToken if set
  if (npmAuthToken) {
    logger.log(`Using token from "${YARNRC_FILENAME}: npmAuthToken"`);

    return npmAuthToken;
  }

  return;
}
