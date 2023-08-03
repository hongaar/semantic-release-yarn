import { getImplementation } from "./container.js";
import type { CommonContext } from "./definitions/context.js";

export async function installYarnPluginIfNeeded(
  name: string,
  { cwd, env, logger, stdout, stderr }: CommonContext
) {
  const execa = await getImplementation("execa");

  const plugins = await getYarnPlugins({ cwd });

  if (!plugins.includes(name)) {
    logger.log('Installing Yarn "%s" plugin in "%s"', name, cwd);

    const pluginImportResult = execa("yarn", ["plugin", "import", name], {
      cwd,
      env,
    });
    pluginImportResult.stdout!.pipe(stdout, { end: false });
    pluginImportResult.stderr!.pipe(stderr, { end: false });
    await pluginImportResult;

    return true;
  }

  return false;
}
export async function getYarnPlugins({ cwd }: { cwd: CommonContext["cwd"] }) {
  const execa = await getImplementation("execa");

  const { stdout } = await execa("yarn", ["plugin", "runtime", "--json"], {
    cwd,
  });

  return stdout.split("\n").reduce((acc, line) => {
    try {
      const { name } = JSON.parse(line);

      if (name !== "@@core") {
        return [...acc, name.replace("@yarnpkg/plugin-", "")];
      }
    } catch {
      // ignore
    }

    return acc;
  }, [] as string[]);
}
