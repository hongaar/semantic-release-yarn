import { getImplementation } from "./container.js";
import type { CommonContext } from "./definitions/context.js";
import { getError } from "./get-error.js";
import { getYarnMajorVersion } from "./get-yarn-version.js";

const MIN_YARN_VERSION = 2;

export async function verifyYarn(context: CommonContext) {
  const { logger } = context;
  const AggregateError = await getImplementation("AggregateError");

  logger.log(`Verify yarn version is >= ${MIN_YARN_VERSION}`);

  const yarnMajorVersion = await getYarnMajorVersion(context);

  if (yarnMajorVersion < MIN_YARN_VERSION) {
    throw new AggregateError([
      getError("EINVALIDYARN", { version: String(yarnMajorVersion) }),
    ]);
  }
}
