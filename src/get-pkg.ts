import { resolve } from "node:path";
import { getImplementation } from "./container.js";
import type { CommonContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getError } from "./get-error.js";

export async function getPkg(
  { pkgRoot }: PluginConfig,
  { cwd }: { cwd: CommonContext["cwd"] },
) {
  const readPackage = await getImplementation("readPackage");

  try {
    const pkg = await readPackage({
      cwd: pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd,
    });

    if (!pkg.name) {
      throw getError("ENOPKGNAME", undefined);
    }

    return pkg;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw getError("ENOPKG", undefined);
    }

    throw error;
  }
}
