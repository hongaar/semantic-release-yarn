import _ from "lodash";
import type { PluginConfig } from "./definitions/pluginConfig.js";
import { ErrorDefinition, getError } from "./get-error.js";

const isNonEmptyString = (value: unknown) =>
  !!(_.isString(value) && value.trim());

const VALIDATORS = {
  npmPublish: _.isBoolean,
  tarballDir: isNonEmptyString,
  pkgRoot: isNonEmptyString,
};

export function verifyConfig({
  npmPublish,
  tarballDir,
  pkgRoot,
}: PluginConfig) {
  const errors = Object.entries({ npmPublish, tarballDir, pkgRoot }).reduce(
    (errors, [option, value]) => {
      if (_.isNil(value)) {
        return errors;
      }

      if (VALIDATORS[option as keyof PluginConfig](value)) {
        return errors;
      }

      return [
        ...errors,
        getError(`EINVALID${option.toUpperCase()}` as any, { [option]: value }),
      ];
    },
    [] as ErrorDefinition[]
  );

  return errors;
}
