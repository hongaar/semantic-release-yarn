import AggregateError from "aggregate-error";
import _ from "lodash";
import type { PackageJson } from "read-pkg";
import tempy from "tempy";
import { addChannel as addChannelNpm } from "./add-channel.js";
import { PLUGIN_NAME } from "./definitions/constants.js";
import type {
  AddChannelContext,
  PrepareContext,
  PublishContext,
  VerifyConditionsContext,
} from "./definitions/context.js";
import { getPkg } from "./get-pkg.js";
import { prepare as prepareNpm } from "./prepare.js";
import { publish as publishNpm } from "./publish.js";
import { verifyAuth } from "./verify-auth.js";
import { verifyConfig } from "./verify-config.js";

export type PluginConfig = {
  npmPublish?: boolean;
  tarballDir?: string;
  pkgRoot?: string;
};

let verified: boolean;
let prepared: boolean;
const npmrc = tempy.file({ name: ".npmrc" });

async function verifyConditions(
  pluginConfig: PluginConfig,
  context: VerifyConditionsContext
) {
  /**
   * If the npm publish plugin is used and has `npmPublish`, `tarballDir` or
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
  }

  const errors = verifyConfig(pluginConfig);

  try {
    const pkg = await getPkg(pluginConfig, context);

    // Verify the npm authentication only if `npmPublish` is not false and `pkg.private` is not `true`
    if (pluginConfig.npmPublish !== false && pkg.private !== true) {
      await verifyAuth(npmrc, pkg, context);
    }
  } catch (error: any) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  verified = true;
}

async function prepare(pluginConfig: PluginConfig, context: PrepareContext) {
  const errors = verified ? [] : verifyConfig(pluginConfig);

  try {
    // Reload package.json in case a previous external step updated it
    const pkg = await getPkg(pluginConfig, context);
    if (
      !verified &&
      pluginConfig.npmPublish !== false &&
      pkg.private !== true
    ) {
      await verifyAuth(npmrc, pkg, context);
    }
  } catch (error: any) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  await prepareNpm(npmrc, pluginConfig, context);
  prepared = true;
}

async function publish(pluginConfig: PluginConfig, context: PublishContext) {
  let pkg;
  const errors = verified ? [] : verifyConfig(pluginConfig);

  try {
    // Reload package.json in case a previous external step updated it
    pkg = await getPkg(pluginConfig, context);
    if (
      !verified &&
      pluginConfig.npmPublish !== false &&
      pkg.private !== true
    ) {
      await verifyAuth(npmrc, pkg, context);
    }
  } catch (error: any) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  if (!prepared) {
    await prepareNpm(npmrc, pluginConfig, context);
  }

  return publishNpm(npmrc, pluginConfig, pkg as PackageJson, context);
}

async function addChannel(
  pluginConfig: PluginConfig,
  context: AddChannelContext
) {
  let pkg;
  const errors = verified ? [] : verifyConfig(pluginConfig);

  try {
    // Reload package.json in case a previous external step updated it
    pkg = await getPkg(pluginConfig, context);
    if (
      !verified &&
      pluginConfig.npmPublish !== false &&
      pkg.private !== true
    ) {
      await verifyAuth(npmrc, pkg, context);
    }
  } catch (error: any) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  return addChannelNpm(npmrc, pluginConfig, pkg as PackageJson, context);
}

export { verifyConditions, prepare, publish, addChannel };
