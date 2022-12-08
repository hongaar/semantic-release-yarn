import test from "ava";
import {
  getYarnPlugins,
  installYarnPluginIfNeeded,
} from "../src/yarn-plugins.js";
import { createContext } from "./helpers/create-context.js";
import { mockExeca } from "./helpers/create-execa-implementation.js";

test.serial("getYarnPlugins", async (t) => {
  const context = createContext();

  mockExeca({
    stdout: `{"name":"@@core","builtin":false}
{"name":"@yarnpkg/plugin-essentials","builtin":true}
{"name":"@yarnpkg/plugin-compat","builtin":true}
{"name":"@yarnpkg/plugin-pnp","builtin":true}
{"name":"@yarnpkg/plugin-pnpm","builtin":true}
{"name":"@yarnpkg/plugin-interactive-tools","builtin":false}
{"name":"@yarnpkg/plugin-typescript","builtin":false}
{"name":"@yarnpkg/plugin-version","builtin":false}`,
  });

  const plugins = await getYarnPlugins(context);

  t.deepEqual(plugins, ["interactive-tools", "typescript", "version"]);
});

test.serial("installYarnPluginIfNeeded when needed", async (t) => {
  const context = createContext();

  mockExeca({ stdout: "" });

  t.true(await installYarnPluginIfNeeded("version", context));
});

test.serial("installYarnPluginIfNeeded when not needed", async (t) => {
  const context = createContext();

  mockExeca({ stdout: '{"name":"@yarnpkg/plugin-version","builtin":false}' });

  t.false(await installYarnPluginIfNeeded("version", context));
});
