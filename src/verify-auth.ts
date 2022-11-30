import AggregateError from "aggregate-error";
import execa from "execa";
import normalizeUrl from "normalize-url";
import type { PackageJson } from "read-pkg";
import type { CommonContext } from "./definitions/context.js";
import { getError } from "./get-error.js";
import { getRegistry } from "./get-registry.js";
import { setYarnrcAuth } from "./set-yarnrc-auth.js";

export async function verifyAuth(
  yarnrc: string,
  pkg: PackageJson,
  context: CommonContext
) {
  const {
    cwd,
    env: { DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org/", ...env },
    stdout,
    stderr,
  } = context;
  const registry = getRegistry(pkg, context);

  await setYarnrcAuth(yarnrc, registry, context);

  if (normalizeUrl(registry) === normalizeUrl(DEFAULT_NPM_REGISTRY)) {
    try {
      const whoamiResult = execa(
        "npm",
        ["whoami", "--userconfig", npmrc, "--registry", registry],
        {
          cwd,
          env,
          preferLocal: true,
        }
      );
      whoamiResult.stdout!.pipe(stdout, { end: false });
      whoamiResult.stderr!.pipe(stderr, { end: false });
      const result = await whoamiResult;
      // Fix for error "Promise resolved with: undefined" on Node >= 16
      if (String(result.stdout).trim() === "undefined") {
        throw new AggregateError([getError("EINVALIDNPMTOKEN", { registry })]);
      }
    } catch {
      throw new AggregateError([getError("EINVALIDNPMTOKEN", { registry })]);
    }
  }
}
