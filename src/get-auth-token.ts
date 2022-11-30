// @ts-ignore
import toNerfDart from "nerf-dart";
import { DEFAULT_NPM_REGISTRY } from "./definitions/constants.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export function getAuthToken(config: Yarnrc, registry: string) {
  const registryId = toNerfDart(registry);
  const defaultRegistryId = toNerfDart(DEFAULT_NPM_REGISTRY);
  const isDefaultRegistry = registryId === defaultRegistryId;

  // Lookup npmRegistries
  const tokenFromRegistriesList = Object.entries(
    config.npmRegistries || {}
  ).find(([id]) => {
    return toNerfDart(id) === registryId;
  })?.[1].npmAuthToken;

  if (tokenFromRegistriesList) {
    return tokenFromRegistriesList;
  }

  // Only npmAuthToken is set
  if (
    isDefaultRegistry &&
    !config.npmRegistryServer &&
    !config.npmPublishRegistry &&
    config.npmAuthToken
  ) {
    return config.npmAuthToken;
  }

  // npmPublishRegistry is set
  if (
    config.npmPublishRegistry &&
    toNerfDart(config.npmPublishRegistry) === registryId &&
    config.npmAuthToken
  ) {
    return config.npmAuthToken;
  }

  // npmPublishRegistry is set
  if (
    config.npmRegistryServer &&
    toNerfDart(config.npmRegistryServer) === registryId &&
    config.npmAuthToken
  ) {
    return config.npmAuthToken;
  }

  // @todo iterate npmScopes[string].npmAuthToken

  return;
}
