import AggregateError from "aggregate-error";
import { cosmiconfig } from "cosmiconfig";
import fs from "fs-extra";
import yaml from "js-yaml";
// @ts-ignore
import nerfDart from "nerf-dart";
import { DEFAULT_NPM_REGISTRY } from "./definitions/constants.js";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";
import { getAuthToken } from "./get-auth-token.js";
import { getError } from "./get-error.js";

export async function setYarnrcAuth(
  yarnrc: string,
  registry: string,
  { cwd, env: { NPM_TOKEN, NPM_CONFIG_USERCONFIG }, logger }: CommonContext
) {
  logger.log("Verify authentication for registry %s", registry);

  let config: Yarnrc = {};

  const result = await cosmiconfig("yarn", {
    searchPlaces: [NPM_CONFIG_USERCONFIG ?? ".yarnrc.yml"],
  }).search();

  console.log({ cwd, process: process.cwd(), result });

  // (
  //   "npm",
  //   { registry: "https://registry.npmjs.org/" },
  //   { config: NPM_CONFIG_USERCONFIG || path.resolve(cwd, ".yarnrc.yml") }
  // );

  if (result !== null) {
    logger.log("Reading yarn config from %s", result.filepath);
    config = result.config;
  }

  config = {
    npmPublishRegistry: DEFAULT_NPM_REGISTRY,
    ...config,
  };

  if (getAuthToken(config, registry)) {
    await fs.outputFile(yarnrc, yaml.dump(config));
    return;
  }

  if (NPM_TOKEN) {
    await fs.outputFile(
      yarnrc,
      yaml.dump({
        ...config,
        npmPublishRegistry: nerfDart(registry),
        npmAuthToken: "${NPM_TOKEN}",
      })
    );
    logger.log(`Wrote NPM_TOKEN to ${yarnrc}`);
  } else {
    throw new AggregateError([getError("ENONPMTOKEN", { registry })]);
  }
}
