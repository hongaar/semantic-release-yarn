// @ts-ignore
import toNerfDart from "nerf-dart";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export function getToken(
  registry: string,
  { npmRegistries, npmAuthToken }: Yarnrc,
  { env }: CommonContext
) {
  // @todo implement yarnrc.npmScopes

  const registryId = toNerfDart(registry);

  // Lookup in yarnrc.npmRegistries
  if (npmRegistries?.[registryId]?.npmAuthToken) {
    return npmRegistries[registryId]!.npmAuthToken!;
  }

  return env["YARN_NPM_AUTH_TOKEN"] || npmAuthToken;
}
