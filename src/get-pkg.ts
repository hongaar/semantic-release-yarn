import AggregateError from "aggregate-error";
import { resolve } from "node:path";
import readPkg from "read-pkg";
import type { CommonContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getError } from "./get-error.js";

export async function getPkg(
  { pkgRoot }: PluginConfig,
  { cwd }: { cwd: CommonContext["cwd"] }
) {
  try {
    const pkg = await readPkg({
      cwd: pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd,
    });

    if (!pkg.name) {
      throw getError("ENOPKGNAME");
    }

    return pkg;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new AggregateError([getError("ENOPKG")]);
    }

    throw new AggregateError([error]);
  }
}
