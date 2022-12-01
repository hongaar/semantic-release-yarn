import fs from "fs-extra";
import yaml from "js-yaml";
import { resolve } from "node:path";
import { directory } from "tempy";
import type { Yarnrc } from "../src/definitions/yarnrc.js";
import { getYarnConfig } from "../src/get-yarn-config.js";
import { createContext } from "./helpers/createContext.js";

test("Read from .yarnrc.yml", async () => {
  const { cwd, logger } = createContext();
  await fs.outputFile(
    resolve(cwd, ".yarnrc.yml"),
    yaml.dump({ npmPublishRegistry: "https://custom1.registry.com" } as Yarnrc)
  );

  expect(await getYarnConfig({ cwd, logger })).toHaveProperty(
    "npmPublishRegistry",
    "https://custom1.registry.com"
  );
});

test("Read from .yarnrc.yml in parent directory", async () => {
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

  expect(yarnrc).toHaveProperty(
    "npmPublishRegistry",
    "https://parentdir.registry.com"
  );
  expect(yarnrc).toHaveProperty("enableColors", true);
});

test("Read from .yarnrc.yml in current directory", async () => {
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

  expect(yarnrc).toHaveProperty(
    "npmPublishRegistry",
    "https://subdir.registry.com"
  );
});
