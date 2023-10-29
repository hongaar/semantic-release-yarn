// @ts-ignore
import toNerfDart from "nerf-dart";

export const PLUGIN_NAME = "semantic-release-yarn";
export const PLUGIN_HOMEPAGE =
  "https://github.com/hongaar/semantic-release-yarn";
export const PLUGIN_GIT_BRANCH = "main";

export const YARNRC_FILENAME = ".yarnrc.yml";

export const DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org";
export const DEFAULT_YARN_REGISTRY = "https://registry.yarnpkg.com";

export const defaultRegistries = [DEFAULT_NPM_REGISTRY, DEFAULT_YARN_REGISTRY];

export function isDefaultRegistry(registry: string) {
  return defaultRegistries.some(
    (defaultRegistry) => toNerfDart(defaultRegistry) === toNerfDart(registry),
  );
}
