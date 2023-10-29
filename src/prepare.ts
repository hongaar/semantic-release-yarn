import fs from "fs-extra";
import { resolve } from "node:path";
import type { PackageJson } from "read-pkg";
import { getImplementation } from "./container.js";
import type { PrepareContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { installYarnPluginIfNeeded } from "./yarn-plugins.js";

const TARBALL_FILENAME = "%s-%v.tgz";

export async function prepare(
  { tarballDir, pkgRoot }: PluginConfig,
  pkg: PackageJson,
  context: PrepareContext,
) {
  const {
    cwd,
    env,
    stdout,
    stderr,
    nextRelease: { version },
    logger,
  } = context;
  const execa = await getImplementation("execa");

  const basePath = pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd;
  const isMonorepo = typeof pkg.workspaces !== "undefined";
  const workspacesPrefix = isMonorepo
    ? [
        "workspaces",
        "foreach",
        "--all",
        "--topological",
        "--verbose",
        "--no-private",
      ]
    : [];

  if (isMonorepo) {
    await installYarnPluginIfNeeded("workspace-tools", {
      ...context,
      cwd: basePath,
    });
  }

  await installYarnPluginIfNeeded("version", { ...context, cwd: basePath });

  logger.log('Write version "%s" to package.json in "%s"', version, basePath);
  const versionResult = execa(
    "yarn",
    [...workspacesPrefix, "version", version, "--immediate"],
    {
      cwd: basePath,
      env,
    },
  );
  versionResult.stdout!.pipe(stdout, { end: false });
  versionResult.stderr!.pipe(stderr, { end: false });
  await versionResult;

  if (tarballDir) {
    logger.log('Creating package tarball in "%s"', tarballDir);
    await fs.ensureDir(resolve(cwd, tarballDir.trim()));
    const packResult = execa(
      "yarn",
      [
        ...workspacesPrefix,
        "pack",
        "--out",
        resolve(cwd, tarballDir.trim(), TARBALL_FILENAME),
      ],
      {
        cwd: basePath,
        env,
      },
    );
    packResult.stdout!.pipe(stdout, { end: false });
    packResult.stderr!.pipe(stderr, { end: false });
    await packResult;
  }
}
