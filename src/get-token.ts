// @ts-ignore
import toNerfDart from "nerf-dart";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export function getToken(
  registry: string,
  { npmRegistries, npmAuthToken }: Yarnrc,
  { env }: { env?: CommonContext["env"] }
) {
  // @todo implement yarnrc.npmScopes

  const registryId = toNerfDart(registry);

  // Lookup in yarnrc.npmRegistries
  const entry =
    npmRegistries &&
    Object.entries(npmRegistries).find(([id, { npmAuthToken }]) => {
      return toNerfDart(id) === registryId && npmAuthToken;
    });

  if (entry) {
    return npmRegistries[entry[0]]!.npmAuthToken!;
  }

  return env?.["YARN_NPM_AUTH_TOKEN"] || npmAuthToken;
}
