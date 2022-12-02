import execa from "execa";
import fs from "fs-extra";
import { resolve } from "node:path";
import type { PrepareContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";

const TARBALL_FILENAME = "%s-%v.tgz";

export async function prepare(
  { tarballDir, pkgRoot }: PluginConfig,
  { cwd, env, stdout, stderr, nextRelease: { version }, logger }: PrepareContext
) {
  const basePath = pkgRoot ? resolve(cwd, pkgRoot) : cwd;

  logger.log("Installing Yarn version plugin in %s", basePath);
  const pluginImportResult = execa("yarn", ["plugin", "import", "version"], {
    cwd: basePath,
    env,
  });
  pluginImportResult.stdout!.pipe(stdout, { end: false });
  pluginImportResult.stderr!.pipe(stderr, { end: false });
  await pluginImportResult;

  logger.log("Write version %s to package.json in %s", version, basePath);
  const versionResult = execa("yarn", ["version", version, "--immediate"], {
    cwd: basePath,
    env,
  });
  versionResult.stdout!.pipe(stdout, { end: false });
  versionResult.stderr!.pipe(stderr, { end: false });
  await versionResult;

  if (tarballDir) {
    logger.log("Creating package tarball in %s", tarballDir);
    await fs.ensureDir(resolve(cwd, tarballDir.trim()));
    const packResult = execa(
      "yarn",
      ["pack", "--out", resolve(cwd, tarballDir.trim(), TARBALL_FILENAME)],
      {
        cwd: basePath,
        env,
        preferLocal: true,
      }
    );
    packResult.stdout!.pipe(stdout, { end: false });
    packResult.stderr!.pipe(stderr, { end: false });
    await packResult;
  }
}
