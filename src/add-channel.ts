import type { PackageJson } from "read-pkg";
import { container } from "./container.js";
import type { AddChannelContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getChannel } from "./get-channel.js";
import { getRegistry } from "./get-registry.js";
import { getReleaseInfo } from "./get-release-info.js";
import { getYarnConfig } from "./get-yarn-config.js";

export async function addChannel(
  { npmPublish }: PluginConfig,
  pkg: PackageJson,
  context: AddChannelContext
) {
  const {
    cwd,
    env,
    stdout,
    stderr,
    nextRelease: { version, channel },
    logger,
  } = context;
  const { execa } = await container();

  if (npmPublish !== false && pkg.private !== true) {
    const yarnrc = await getYarnConfig(context);
    const registry = getRegistry(pkg, yarnrc, context);
    const distTag = getChannel(channel!);

    logger.log(
      `Adding version ${version} to npm registry ${registry} on dist-tag ${distTag}`
    );
    const result = execa(
      "yarn",
      ["npm", "tag", "add", `${pkg.name}@${version}`, distTag],
      {
        cwd,
        env,
      }
    );
    result.stdout!.pipe(stdout, { end: false });
    result.stderr!.pipe(stderr, { end: false });
    await result;

    logger.log(
      `Added ${pkg.name}@${version} to dist-tag @${distTag} on ${registry}`
    );

    return getReleaseInfo(pkg, context, distTag, registry);
  }

  logger.log(
    `Skip adding to npm channel as ${
      npmPublish === false ? "npmPublish" : "package.json's private property"
    } is ${npmPublish !== false}`
  );

  return false;
}
