import _ from "lodash";
import { getError } from "./get-error.js";
import type { PluginConfig } from "./index.js";

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
    [] as Error[]
  );

  return errors;
}
