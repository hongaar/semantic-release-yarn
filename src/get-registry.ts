import type { PackageJson } from "read-pkg";
import { DEFAULT_NPM_REGISTRY } from "./definitions/constants.js";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export function getRegistry(
  { publishConfig }: PackageJson,
  { npmRegistryServer, npmPublishRegistry }: Yarnrc,
  { env }: { env?: CommonContext["env"] }
) {
  const publishConfigRegistry = publishConfig?.["registry"] as
    | string
    | undefined;

  return (
    publishConfigRegistry ||
    env?.["YARN_NPM_PUBLISH_REGISTRY"] ||
    npmPublishRegistry ||
    env?.["YARN_NPM_REGISTRY_SERVER"] ||
    npmRegistryServer ||
    DEFAULT_NPM_REGISTRY
  );
}
