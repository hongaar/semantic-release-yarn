import { getImplementation } from "./container.js";
import type { VerifyConditionsContext } from "./definitions/context.js";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getPkg } from "./get-pkg.js";
import { shouldPublish } from "./should-publish.js";
import { verifyAuth } from "./verify-auth.js";
import { verifyConfig } from "./verify-config.js";
import { verifyYarn } from "./verify-yarn.js";

export async function verify(
  pluginConfig: PluginConfig,
  context: VerifyConditionsContext
) {
  const AggregateError = await getImplementation("AggregateError");

  let errors = verifyConfig(pluginConfig);

  try {
    verifyYarn(context);
  } catch (error: any) {
    errors = [...errors, ...(error.errors ? error.errors : [error])];
  }

  try {
    const pkg = await getPkg(pluginConfig, context);

    if (shouldPublish(pluginConfig, pkg)) {
      await verifyAuth(pluginConfig, pkg, context);
    }
  } catch (error: any) {
    errors = [...errors, ...(error.errors ? error.errors : [error])];
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
}
