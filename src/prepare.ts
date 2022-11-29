import execa from "execa";
import { move } from "fs-extra";
import { resolve } from "node:path";
import type { PrepareContext } from "./definitions/context.js";
import type { PluginConfig } from "./index.js";

export async function prepare(
  npmrc: string,
  { tarballDir, pkgRoot }: PluginConfig,
  { cwd, env, stdout, stderr, nextRelease: { version }, logger }: PrepareContext
) {
  const basePath = pkgRoot ? resolve(cwd, pkgRoot) : cwd;

  logger.log("Write version %s to package.json in %s", version, basePath);

  const versionResult = execa(
    "npm",
    [
      "version",
      version,
      "--userconfig",
      npmrc,
      "--no-git-tag-version",
      "--allow-same-version",
    ],
    {
      cwd: basePath,
      env,
      preferLocal: true,
    }
  );
  versionResult.stdout!.pipe(stdout, { end: false });
  versionResult.stderr!.pipe(stderr, { end: false });

  await versionResult;

  if (tarballDir) {
    logger.log("Creating npm package version %s", version);
    const packResult = execa("npm", ["pack", basePath, "--userconfig", npmrc], {
      cwd,
      env,
      preferLocal: true,
    });
    packResult.stdout!.pipe(stdout, { end: false });
    packResult.stderr!.pipe(stderr, { end: false });

    const tarball = (await packResult).stdout.split("\n").pop()!;
    const tarballSource = resolve(cwd, tarball);
    const tarballDestination = resolve(cwd, tarballDir.trim(), tarball);

    // Only move the tarball if we need to
    // Fixes: https://github.com/semantic-release/npm/issues/169
    if (tarballSource !== tarballDestination) {
      await move(tarballSource, tarballDestination);
    }
  }
}
