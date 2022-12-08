import { resolve } from "node:path";
import type { PackageJson } from "read-pkg";
import { getImplementation } from "./container.js";
import type { AddChannelContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getChannel } from "./get-channel.js";
import { getRegistry } from "./get-registry.js";
import { getReleaseInfo } from "./get-release-info.js";
import { getYarnConfig } from "./get-yarn-config.js";
import { reasonToNotPublish, shouldPublish } from "./should-publish.js";

export async function addChannel(
  pluginConfig: PluginConfig,
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
  const { pkgRoot } = pluginConfig;
  const execa = await getImplementation("execa");

  if (shouldPublish(pluginConfig, pkg)) {
    const basePath = pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd;
    const yarnrc = await getYarnConfig(context);
    const registry = getRegistry(pkg, yarnrc, context);
    const distTag = getChannel(channel!);
    const isMonorepo = typeof pkg.workspaces !== "undefined";

    if (isMonorepo) {
      logger.log(`Adding npm tags to monorepo workspaces is not supported yet`);
      return false;
    }

    logger.log(
      `Adding version ${version} to npm registry ${registry} on dist-tag ${distTag}`
    );
    const result = execa(
      "yarn",
      ["npm", "tag", "add", `${pkg.name}@${version}`, distTag],
      {
        cwd: basePath,
        env,
      }
    );
    result.stdout!.pipe(stdout, { end: false });
    result.stderr!.pipe(stderr, { end: false });
    await result;

    logger.log(
      `Added ${pkg.name}@${version} to dist-tag @${distTag} on ${registry}`
    );

    return getReleaseInfo(pkg, pluginConfig, context, distTag, registry);
  }

  const reason = reasonToNotPublish(pluginConfig, pkg);

  logger.log(`Skip adding to npm channel as ${reason}`);

  return false;
}
