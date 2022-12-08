import _ from "lodash";
import { addChannel as addChannelNpm } from "./add-channel.js";
import { PLUGIN_NAME } from "./definitions/constants.js";
import type {
  AddChannelContext,
  PrepareContext,
  PublishContext,
  VerifyConditionsContext,
} from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getPkg } from "./get-pkg.js";
import { prepare as prepareNpm } from "./prepare.js";
import { publish as publishNpm } from "./publish.js";
import { verify } from "./verify.js";

let verified: boolean;
let prepared: boolean;

export async function verifyConditions(
  pluginConfig: PluginConfig,
  context: VerifyConditionsContext
) {
  /**
   * If the plugin is used and has `npmPublish`, `tarballDir` or
   * `pkgRoot` configured, validate them now in order to prevent any release if
   * the configuration is wrong
   */
  if (context.options?.["publish"]) {
    const publishPlugin =
      _.castArray(context.options["publish"]).find(
        (config) => config.path && config.path === PLUGIN_NAME
      ) || {};

    pluginConfig.npmPublish = _.defaultTo(
      pluginConfig.npmPublish,
      publishPlugin.npmPublish
    );
    pluginConfig.tarballDir = _.defaultTo(
      pluginConfig.tarballDir,
      publishPlugin.tarballDir
    );
    pluginConfig.pkgRoot = _.defaultTo(
      pluginConfig.pkgRoot,
      publishPlugin.pkgRoot
    );
    pluginConfig.mainWorkspace = _.defaultTo(
      pluginConfig.mainWorkspace,
      publishPlugin.mainWorkspace
    );
  }

  await verify(pluginConfig, context);

  verified = true;
}

export async function prepare(
  pluginConfig: PluginConfig,
  context: PrepareContext
) {
  if (!verified) {
    await verify(pluginConfig, context);
  }

  const pkg = await getPkg(pluginConfig, context);

  await prepareNpm(pluginConfig, pkg, context);

  prepared = true;
}

export async function publish(
  pluginConfig: PluginConfig,
  context: PublishContext
) {
  if (!verified) {
    await verify(pluginConfig, context);
  }

  const pkg = await getPkg(pluginConfig, context);

  if (!prepared) {
    await prepareNpm(pluginConfig, pkg, context);
  }

  return publishNpm(pluginConfig, pkg, context);
}

export async function addChannel(
  pluginConfig: PluginConfig,
  context: AddChannelContext
) {
  if (!verified) {
    await verify(pluginConfig, context);
  }

  const pkg = await getPkg(pluginConfig, context);

  return addChannelNpm(pluginConfig, pkg, context);
}
