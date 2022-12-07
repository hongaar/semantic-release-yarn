import type { PackageJson } from "read-pkg";
import type { PluginConfig } from "./definitions/pluginConfig.js";

/**
 * Returns [true, null] if `npmPublish` is not `false` and `pkg.private` is not
 * `true` or `pkg.workspaces` is not `undefined`.
 * Returns [false, reason] otherwise.
 */
function shouldPublishTuple(
  pluginConfig: PluginConfig,
  pkg: PackageJson
): [boolean, string | null] {
  const reasonToNotPublish =
    pluginConfig.npmPublish === false
      ? "npmPublish plugin option is false"
      : pkg.private === true && typeof pkg.workspaces === "undefined"
      ? "package is private and has no workspaces"
      : null;

  const shouldPublish = !reasonToNotPublish;

  return [shouldPublish, reasonToNotPublish];
}

export function shouldPublish(pluginConfig: PluginConfig, pkg: PackageJson) {
  return shouldPublishTuple(pluginConfig, pkg)[0];
}

export function reasonToNotPublish(
  pluginConfig: PluginConfig,
  pkg: PackageJson
) {
  return shouldPublishTuple(pluginConfig, pkg)[1];
}
