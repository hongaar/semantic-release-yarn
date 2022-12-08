import { cosmiconfig } from "cosmiconfig";
import _ from "lodash";
import { dirname, resolve } from "node:path";
import { YARNRC_FILENAME } from "./definitions/constants.js";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export async function getYarnConfig({
  cwd,
  logger,
}: {
  cwd: CommonContext["cwd"];
  logger: CommonContext["logger"];
}): Promise<Yarnrc> {
  const result = await cosmiconfigSearchRecursive<Yarnrc>(
    cosmiconfig("yarn", {
      searchPlaces: [YARNRC_FILENAME],
    }),
    cwd
  );

  if (!result) {
    return {};
  }

  logger.log("Reading yarn config from %s", result.files.join(", "));

  return result.config;
}

// https://github.com/chrisblossom/cosmiconfig-all-example/blob/master/src/cosmiconfig-all-example.js
async function cosmiconfigSearchRecursive<T>(
  explorer: ReturnType<typeof cosmiconfig>,
  searchFrom: string
) {
  let config: T = {} as T;
  const files: string[] = [];

  async function getNext(currentPath: string): Promise<void> {
    const currentResult = await explorer.search(currentPath);

    // If no result found, end search
    if (!currentResult) {
      return;
    }

    // Merge current results
    files.push(currentResult.filepath);
    config = _.merge({}, currentResult.config, config);

    // Get the next parent directory
    const nextPath = resolve(dirname(currentResult.filepath), "../");

    return getNext(nextPath);
  }

  await getNext(searchFrom);

  return files.length ? { config, files } : null;
}
