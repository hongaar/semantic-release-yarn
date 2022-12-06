import { resolve } from "node:path";
import type { PackageJson } from "read-pkg";
import { getImplementation } from "./container.js";
import type { PublishContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getChannel } from "./get-channel.js";
import { getRegistry } from "./get-registry.js";
import { getReleaseInfo } from "./get-release-info.js";
import { getYarnConfig } from "./get-yarn-config.js";

export async function publish(
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
  const execa = await getImplementation("execa");

  if (npmPublish !== false && pkg.private !== true) {
    const basePath = pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd;
    const yarnrc = await getYarnConfig(context);
    const registry = getRegistry(pkg, yarnrc, context);
    const distTag = getChannel(channel!);

    logger.log(
      `Publishing version ${version} to npm registry ${registry} on dist-tag ${distTag}`
    );
    const result = execa("yarn", ["npm", "publish", "--tag", distTag], {
      cwd: basePath,
      env,
    });
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
