import type { PackageJson } from "read-pkg";
import {
  DEFAULT_NPM_REGISTRY,
  YARNRC_FILENAME,
} from "./definitions/constants.js";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export function getRegistry(
  { publishConfig }: PackageJson,
  { npmRegistryServer, npmPublishRegistry }: Yarnrc,
  {
    env,
    logger,
  }: { env: CommonContext["env"]; logger: CommonContext["logger"] }
) {
  const publishConfigRegistry = publishConfig?.["registry"] as
    | string
    | undefined;

  if (publishConfigRegistry) {
    logger.log(
      `Using registry "%s" from "package.json: publishConfig.registry"`,
      publishConfigRegistry
    );

    return publishConfigRegistry;
  }

  if (env["YARN_NPM_PUBLISH_REGISTRY"]) {
    logger.log(
      `Using registry "%s" from environment variable YARN_NPM_PUBLISH_REGISTRY`,
      env["YARN_NPM_PUBLISH_REGISTRY"]
    );

    return env["YARN_NPM_PUBLISH_REGISTRY"];
  }

  if (npmPublishRegistry) {
    logger.log(
      `Using registry "%s" from "${YARNRC_FILENAME}: npmPublishRegistry"`,
      npmPublishRegistry
    );

    return npmPublishRegistry;
  }

  if (env["YARN_NPM_REGISTRY_SERVER"]) {
    logger.log(
      `Using registry "%s" from environment variable YARN_NPM_REGISTRY_SERVER`,
      env["YARN_NPM_REGISTRY_SERVER"]
    );

    return env["YARN_NPM_REGISTRY_SERVER"];
  }

  if (npmRegistryServer) {
    logger.log(
      `Using registry "%s" from "${YARNRC_FILENAME}: npmRegistryServer"`,
      npmRegistryServer
    );

    return npmRegistryServer;
  }

  logger.log(`Using default registry "%s"`, DEFAULT_NPM_REGISTRY);

  return DEFAULT_NPM_REGISTRY;
}
