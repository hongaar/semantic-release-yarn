import { getImplementation } from "./container.js";
import type { CommonContext } from "./definitions/context.js";
import { getError } from "./get-error.js";

export async function getYarnVersion({ cwd }: { cwd: CommonContext["cwd"] }) {
  const execa = await getImplementation("execa");

  try {
    return (await execa("yarn", ["--version"], { cwd })).stdout;
  } catch {
    throw getError("ENOYARN", undefined);
  }
}

export async function getYarnMajorVersion({
  cwd,
}: {
  cwd: CommonContext["cwd"];
}) {
  const yarnVersion = await getYarnVersion({ cwd });

  const majorVersionComponent = yarnVersion.split(".")[0];

  if (
    !majorVersionComponent ||
    Number.isNaN(parseInt(majorVersionComponent, 10))
  ) {
    throw new Error(
      `Could not determine Yarn major version, got "${yarnVersion}"`
    );
  }

  return parseInt(majorVersionComponent, 10);
}
