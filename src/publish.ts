import { resolve } from "node:path";
import type { PackageJson } from "read-pkg";
import { getImplementation } from "./container.js";
import type { PublishContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getChannel } from "./get-channel.js";
import { getRegistry } from "./get-registry.js";
import { getReleaseInfo } from "./get-release-info.js";
import { getYarnConfig } from "./get-yarn-config.js";
import { reasonToNotPublish, shouldPublish } from "./should-publish.js";

export async function publish(
  pluginConfig: PluginConfig,
  pkg: PackageJson,
  context: PublishContext,
) {
  const {
    cwd,
    env,
    stdout,
    stderr,
    nextRelease: { version, channel },
    logger,
  } = context;
  const { pkgRoot, mainWorkspace } = pluginConfig;
  const execa = await getImplementation("execa");

  if (shouldPublish(pluginConfig, pkg)) {
    const basePath = pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd;
    const yarnrc = await getYarnConfig(context);
    const registry = getRegistry(pkg, yarnrc, context);
    const distTag = getChannel(channel!);
    const isMonorepo = typeof pkg.workspaces !== "undefined";
    const workspacesPrefix = isMonorepo
      ? [
          "workspaces",
          "foreach",
          "--worktree",
          "--topological",
          "--verbose",
          "--no-private",
        ]
      : [];

    logger.log(
      `Publishing version ${version} to npm registry ${registry} (tagged as @${distTag})`,
    );
    const result = execa(
      "yarn",
      [...workspacesPrefix, "npm", "publish", "--tag", distTag],
      {
        cwd: basePath,
        env,
      },
    );
    result.stdout!.pipe(stdout, { end: false });
    result.stderr!.pipe(stderr, { end: false });
    await result;

    logger.log(
      `Published ${
        mainWorkspace ?? pkg.name
      }@${version} on ${registry} (tagged as @${distTag})`,
    );

    return getReleaseInfo(pkg, pluginConfig, context, distTag, registry);
  }

  const reason = reasonToNotPublish(pluginConfig, pkg);

  logger.log(`Skip publishing to npm registry as ${reason}`);

  return false;
}
