import AggregateError from "aggregate-error";
import path from "path";
import readPkg from "read-pkg";
import type { CommonContext } from "./definitions/context.js";
import { getError } from "./get-error.js";
import type { PluginConfig } from "./index.js";

export async function getPkg(
  { pkgRoot }: PluginConfig,
  { cwd }: CommonContext
) {
  try {
    const pkg = await readPkg({
      cwd: pkgRoot ? path.resolve(cwd, String(pkgRoot)) : cwd,
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
