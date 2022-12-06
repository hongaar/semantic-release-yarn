import { execa } from "execa";
import type { CommonContext } from "../../src/definitions/context.js";

export async function getPackageVersion(
  pkgName: string,
  { cwd, env }: { cwd: CommonContext["cwd"]; env: CommonContext["env"] }
) {
  return JSON.parse(
    (
      await execa(
        "yarn",
        ["npm", "info", pkgName, "--fields", "version", "--json"],
        { cwd, env }
      )
    ).stdout
  ).version as string;
}

export async function getPackageTags(
  pkgName: string,
  { cwd, env }: { cwd: CommonContext["cwd"]; env: CommonContext["env"] }
) {
  return JSON.parse(
    (
      await execa(
        "yarn",
        ["npm", "info", pkgName, "--fields", "dist-tags", "--json"],
        { cwd, env }
      )
    ).stdout
  )["dist-tags"] as Record<string, string>;
}
