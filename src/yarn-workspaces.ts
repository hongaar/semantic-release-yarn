import { getImplementation } from "./container.js";
import type { CommonContext } from "./definitions/context.js";

export async function getWorkspaces({ cwd }: { cwd: CommonContext["cwd"] }) {
  const execa = await getImplementation("execa");

  const { stdout } = await execa(
    "yarn",
    ["workspaces", "list", "--json", "--no-private"],
    {
      cwd,
    },
  );

  return stdout
    .split("\n")
    .reduce(
      (acc, line) => [...acc, JSON.parse(line)],
      [] as { location: string; name: string }[],
    );
}
