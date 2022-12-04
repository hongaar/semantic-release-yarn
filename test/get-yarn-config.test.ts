import test from "ava";
import fs from "fs-extra";
import yaml from "js-yaml";
import { resolve } from "node:path";
import { directory } from "tempy";
import type { Yarnrc } from "../src/definitions/yarnrc.js";
import { getYarnConfig } from "../src/get-yarn-config.js";
import { createContext } from "./helpers/create-context.js";

test("Read from .yarnrc.yml", async (t) => {
  const { cwd, logger } = createContext();
  await fs.outputFile(
    resolve(cwd, ".yarnrc.yml"),
    yaml.dump({ npmPublishRegistry: "https://custom1.registry.com" } as Yarnrc)
  );

  const yarnrc = await getYarnConfig({ cwd, logger });

  t.is(yarnrc.npmPublishRegistry, "https://custom1.registry.com");
});

test("Read from .yarnrc.yml in parent directory", async (t) => {
  const { logger } = createContext();
  const parent = directory();
  const cwd = resolve(parent, "subdir");
  await fs.outputFile(
    resolve(cwd, ".yarnrc.yml"),
    yaml.dump({ enableColors: true } as Yarnrc)
  );
  await fs.outputFile(
    resolve(parent, ".yarnrc.yml"),
    yaml.dump({
      npmPublishRegistry: "https://parentdir.registry.com",
    } as Yarnrc)
  );

  const yarnrc = await getYarnConfig({ cwd, logger });

  t.is(yarnrc.npmPublishRegistry, "https://parentdir.registry.com");
  t.is(yarnrc.enableColors, true);
});

test("Read from .yarnrc.yml in current directory", async (t) => {
  const { logger } = createContext();
  const parent = directory();
  const cwd = resolve(parent, "subdir");
  await fs.outputFile(
    resolve(cwd, ".yarnrc.yml"),
    yaml.dump({ npmPublishRegistry: "https://subdir.registry.com" } as Yarnrc)
  );
  await fs.outputFile(
    resolve(parent, ".yarnrc.yml"),
    yaml.dump({
      npmPublishRegistry: "https://parentdir.registry.com",
    } as Yarnrc)
  );

  const yarnrc = await getYarnConfig({ cwd, logger });

  t.is(yarnrc.npmPublishRegistry, "https://subdir.registry.com");
});
