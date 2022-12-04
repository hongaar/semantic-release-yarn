import AggregateError from "aggregate-error";
import type { CommonContext } from "./definitions/context.js";
import { getError } from "./get-error.js";
import { getYarnMajorVersion } from "./get-yarn-version.js";

const MIN_YARN_VERSION = 2;

export async function verifyYarn(context: CommonContext) {
  const { logger } = context;

  logger.log("Verify yarn version");

  const yarnMajorVersion = await getYarnMajorVersion(context);

  if (yarnMajorVersion < MIN_YARN_VERSION) {
    throw new AggregateError([
      getError("EINVALIDYARN", { version: yarnMajorVersion }),
    ]);
  }
}
