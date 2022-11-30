import { cosmiconfig } from "cosmiconfig";
import type { CommonContext } from "./definitions/context.js";
import type { Yarnrc } from "./definitions/yarnrc.js";

export async function getYarnConfig({ cwd }: CommonContext): Promise<Yarnrc> {
  const result = await cosmiconfig("yarn", {
    searchPlaces: [".yarnrc.yml"],
  }).search(cwd);

  console.log({ cwd, "process.cwd()": process.cwd(), result });

  if (!result) {
    return {};
  }

  return result.config;
}
