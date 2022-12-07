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
  const { pkgRoot } = pluginConfig;
  const execa = await getImplementation("execa");

  if (shouldPublish(pluginConfig, pkg)) {
    const basePath = pkgRoot ? resolve(cwd, String(pkgRoot)) : cwd;
    const yarnrc = await getYarnConfig(context);
    const registry = getRegistry(pkg, yarnrc, context);
    const distTag = getChannel(channel!);
    const isMonorepo = typeof pkg.workspaces !== "undefined";
    const workspacesPrefix = isMonorepo
      ? ["workspaces", "foreach", "--topological", "--verbose", "--no-private"]
      : [];

    if (isMonorepo) {
      logger.log("Installing Yarn workspace-tools plugin in %s", basePath);
      const pluginImportResult = execa(
        "yarn",
        ["plugin", "import", "workspace-tools"],
        {
          cwd: basePath,
          env,
        }
      );
      pluginImportResult.stdout!.pipe(stdout, { end: false });
      pluginImportResult.stderr!.pipe(stderr, { end: false });
      await pluginImportResult;

      logger.log("Running `yarn install` in %s", basePath);
      const yarnInstallResult = execa("yarn", ["install", "--no-immutable"], {
        cwd: basePath,
        env,
      });
      yarnInstallResult.stdout!.pipe(stdout, { end: false });
      yarnInstallResult.stderr!.pipe(stderr, { end: false });
      await yarnInstallResult;
    }

    logger.log(
      `Publishing version ${version} to npm registry ${registry} on dist-tag ${distTag}`
    );
    const result = execa(
      "yarn",
      [...workspacesPrefix, "npm", "publish", "--tag", distTag],
      {
        cwd: basePath,
        env,
      }
    );
    result.stdout!.pipe(stdout, { end: false });
    result.stderr!.pipe(stderr, { end: false });
    await result;

    logger.log(
      `Published ${pkg.name}@${version} to dist-tag @${distTag} on ${registry}`
    );

    return getReleaseInfo(pkg, context, distTag, registry);
  }

  const reason = reasonToNotPublish(pluginConfig, pkg);

  logger.log(`Skip publishing to npm registry as ${reason}`);

  return false;
}
