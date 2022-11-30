import path from "node:path";
import rc from "rc";
import type { PackageJson } from "read-pkg";
import getRegistryUrl from "registry-auth-token/registry-url.js";
import type { CommonContext } from "./definitions/context.js";

export function getRegistry(
  { publishConfig: { registry } = {}, name }: PackageJson,
  { cwd, env }: CommonContext
) {
  rc(
    "npm",
    { registry: "https://registry.npmjs.org/" },
    { config: env["NPM_CONFIG_USERCONFIG"] || path.resolve(cwd, ".yarnrc.yml") }
  );

  return (registry ||
    env["NPM_CONFIG_REGISTRY"] ||
    getRegistryUrl(
      name!.split("/")[0]!,
      rc(
        "npm",
        { registry: "https://registry.npmjs.org/" },
        {
          config:
            env["NPM_CONFIG_USERCONFIG"] || path.resolve(cwd, ".yarnrc.yml"),
        }
      ) as any
    )) as string;
}
