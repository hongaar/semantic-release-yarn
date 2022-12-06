import { resolve } from "node:path";
import type { PackageJson } from "read-pkg";
import { getImplementation } from "./container.js";
import { isDefaultRegistry } from "./definitions/constants.js";
import type { CommonContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getError } from "./get-error.js";
import { getRegistry } from "./get-registry.js";
import { getToken } from "./get-token.js";
import { getYarnConfig } from "./get-yarn-config.js";

export async function verifyAuth(
  { pkgRoot }: PluginConfig,
  pkg: PackageJson,
  context: CommonContext
) {
  const { cwd, env, stdout, stderr, logger } = context;
  const basePath = pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd;
  const execa = await getImplementation("execa");
  const AggregateError = await getImplementation("AggregateError");

  logger.log("Verify authentication");

  const yarnrc = await getYarnConfig(context);
  const registry = getRegistry(pkg, yarnrc, context);
  const token = getToken(registry, yarnrc, context);

  if (!token) {
    throw new AggregateError([getError("ENONPMTOKEN", { registry })]);
  }

  if (!isDefaultRegistry(registry)) {
    return;
  }

  try {
    // @todo deal with npm npm whoami --scope if pkg is scoped
    const whoamiResult = execa("yarn", ["npm", "whoami", "--publish"], {
      cwd: basePath,
      env,
    });
    whoamiResult.stdout!.pipe(stdout, { end: false });
    whoamiResult.stderr!.pipe(stderr, { end: false });
    await whoamiResult;
  } catch {
    throw new AggregateError([getError("EINVALIDNPMTOKEN", { registry })]);
  }
}
