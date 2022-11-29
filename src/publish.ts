import execa from "execa";
import path from "node:path";
import type { PackageJson } from "read-pkg";
import type { PublishContext } from "./definitions/context.js";
import { getChannel } from "./get-channel.js";
import { getRegistry } from "./get-registry.js";
import { getReleaseInfo } from "./get-release-info.js";
import type { PluginConfig } from "./index.js";

export async function publish(
  npmrc: string,
  { npmPublish, pkgRoot }: PluginConfig,
  pkg: PackageJson,
  context: PublishContext
) {
  const {
    cwd,
    env,
    stdout,
    stderr,
    nextRelease: { version, channel },
    logger,
  } = context;

  if (npmPublish !== false && pkg.private !== true) {
    const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd;
    const registry = getRegistry(pkg, context);
    const distTag = getChannel(channel!);

    logger.log(
      `Publishing version ${version} to npm registry on dist-tag ${distTag}`
    );
    const result = execa(
      "npm",
      [
        "publish",
        basePath,
        "--userconfig",
        npmrc,
        "--tag",
        distTag,
        "--registry",
        registry,
      ],
      { cwd, env, preferLocal: true }
    );
    result.stdout!.pipe(stdout, { end: false });
    result.stderr!.pipe(stderr, { end: false });
    await result;

    logger.log(
      `Published ${pkg.name}@${version} to dist-tag @${distTag} on ${registry}`
    );

    return getReleaseInfo(pkg, context, distTag, registry);
  }

  logger.log(
    `Skip publishing to npm registry as ${
      npmPublish === false ? "npmPublish" : "package.json's private property"
    } is ${npmPublish !== false}`
  );

  return false;
}