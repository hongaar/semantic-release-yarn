import AggregateError from "aggregate-error";
import type { VerifyConditionsContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getPkg } from "./get-pkg.js";
import { verifyAuth } from "./verify-auth.js";
import { verifyConfig } from "./verify-config.js";
import { verifyYarn } from "./verify-yarn.js";

export async function verify(
  pluginConfig: PluginConfig,
  context: VerifyConditionsContext
) {
  let errors = verifyConfig(pluginConfig);

  try {
    verifyYarn(context);
  } catch (error: any) {
    errors = [...errors, ...(error.errors ? error.errors : [error])];
  }

  try {
    const pkg = await getPkg(pluginConfig, context);

    // Verify the npm authentication only if `npmPublish` is not false and
    // `pkg.private` is not`true`
    if (pluginConfig.npmPublish !== false && pkg.private !== true) {
      await verifyAuth(pluginConfig, pkg, context);
    }
  } catch (error: any) {
    errors = [...errors, ...(error.errors ? error.errors : [error])];
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
}
