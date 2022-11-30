import test from "ava";
import fs from "fs-extra";
import { resolve } from "node:path";
import { directory } from "tempy";
import { getRegistry } from "../dist/get-registry.js";

test("Get default registry", (t) => {
  const cwd = directory();
  t.is(
    getRegistry({ name: "package-name" }, { cwd, env: {} }),
    "https://registry.npmjs.org/"
  );
  t.is(
    getRegistry({ name: "package-name", publishConfig: {} }, { cwd, env: {} }),
    "https://registry.npmjs.org/"
  );
});

test('Get the registry configured in ".yarnrc.yml" and normalize trailing slash', async (t) => {
  const cwd = directory();
  await fs.appendFile(
    resolve(cwd, ".yarnrc.yml"),
    "registry = https://custom1.registry.com"
  );

  t.is(
    getRegistry({ name: "package-name" }, { cwd, env: {} }),
    "https://custom1.registry.com/"
  );
});

test('Get the registry configured from "publishConfig"', async (t) => {
  const cwd = directory();
  await fs.appendFile(
    resolve(cwd, ".yarnrc.yml"),
    "registry = https://custom2.registry.com"
  );

  t.is(
    getRegistry(
      {
        name: "package-name",
        publishConfig: { registry: "https://custom3.registry.com/" },
      },
      { cwd, env: {} }
    ),
    "https://custom3.registry.com/"
  );
});

test('Get the registry configured in "NPM_CONFIG_REGISTRY"', (t) => {
  const cwd = directory();

  t.is(
    getRegistry(
      { name: "package-name" },
      { cwd, env: { NPM_CONFIG_REGISTRY: "https://custom1.registry.com/" } }
    ),
    "https://custom1.registry.com/"
  );
});

test('Get the registry configured in ".yarnrc.yml" for scoped package', async (t) => {
  const cwd = directory();
  await fs.appendFile(
    resolve(cwd, ".yarnrc.yml"),
    "@scope:registry = https://custom3.registry.com"
  );

  t.is(
    getRegistry({ name: "@scope/package-name" }, { cwd, env: {} }),
    "https://custom3.registry.com/"
  );
});

test.serial(
  'Get the registry configured via "NPM_CONFIG_USERCONFIG" for scoped package',
  async (t) => {
    const cwd = directory();
    await fs.appendFile(
      resolve(cwd, ".custom-npmrc"),
      "@scope:registry = https://custom4.registry.com"
    );

    t.is(
      getRegistry(
        {
          name: "@scope/package-name",
        },
        {
          cwd,
          env: { NPM_CONFIG_USERCONFIG: resolve(cwd, ".custom-npmrc") },
        }
      ),
      "https://custom4.registry.com/"
    );
  }
);
