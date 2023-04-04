import _ from "lodash";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { getError, type ErrorDefinition } from "./get-error.js";

const isNonEmptyString = (value: unknown) =>
  !!(_.isString(value) && value.trim());

const VALIDATORS = {
  npmPublish: _.isBoolean,
  tarballDir: isNonEmptyString,
  pkgRoot: isNonEmptyString,
  mainWorkspace: isNonEmptyString,
};

export function verifyConfig(config: PluginConfig) {
  const errors = Object.entries(config).reduce((errors, [option, value]) => {
    if (_.isNil(value)) {
      return errors;
    }

    if (!(option in VALIDATORS)) {
      return errors;
    }

    if (VALIDATORS[option as keyof PluginConfig](value)) {
      return errors;
    }

    return [
      ...errors,
      getError(`EINVALID${option.toUpperCase()}` as any, { [option]: value }),
    ];
  }, [] as ErrorDefinition[]);

  return errors;
}
