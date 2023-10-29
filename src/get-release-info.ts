// @ts-ignore
import type { PackageJson } from "read-pkg";
import { isDefaultRegistry } from "./definitions/constants.js";
import type { PublishContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";

export function getReleaseInfo(
  { name }: PackageJson,
  { mainWorkspace }: PluginConfig,
  {
    nextRelease: { version },
  }: {
    env: PublishContext["env"];
    nextRelease: PublishContext["nextRelease"];
  },
  distTag: string,
  registry: string,
) {
  return {
    name: `npm package (@${distTag} dist-tag)`,
    url: isDefaultRegistry(registry)
      ? `https://www.npmjs.com/package/${mainWorkspace ?? name}/v/${version}`
      : undefined,
    channel: distTag,
  };
}
