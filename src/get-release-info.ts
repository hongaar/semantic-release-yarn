import normalizeUrl from "normalize-url";
import type { PackageJson } from "read-pkg";
import type { PublishContext } from "./definitions/context.js";

export function getReleaseInfo(
  { name }: PackageJson,
  {
    env: { DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org/" },
    nextRelease: { version },
  }: PublishContext,
  distTag: string,
  registry: string
) {
  return {
    name: `npm package (@${distTag} dist-tag)`,
    url:
      normalizeUrl(registry) === normalizeUrl(DEFAULT_NPM_REGISTRY)
        ? `https://www.npmjs.com/package/${name}/v/${version}`
        : undefined,
    channel: distTag,
  };
}
