import execa from "execa";
import fs from "fs-extra";
import yaml from "js-yaml";
import { resolve } from "node:path";
import type { Yarnrc } from "../src/definitions/yarnrc.js";
import { verifyAuth } from "../src/verify-auth.js";
import { createContext } from "./helpers/create-context.js";
import {
  mockExeca,
  mockExecaError,
} from "./helpers/create-execa-implementation.js";

jest.mock("execa");

test("No token", async () => {
  const context = createContext();
  await fs.outputFile(
    resolve(context.cwd, ".yarnrc.yml"),
    yaml.dump({} as Yarnrc)
  );

  expect.assertions(2);
  try {
    await verifyAuth({}, context);
  } catch (e: any) {
    const [error] = e;
    expect(error.name).toBe("SemanticReleaseError");
    expect(error.code).toBe("ENONPMTOKEN");
  }
});

test("Invalid token", async () => {
  const context = createContext();
  await fs.outputFile(
    resolve(context.cwd, ".yarnrc.yml"),
    yaml.dump({
      npmAuthToken: "invalid",
    } as Yarnrc)
  );

  mockExecaError(execa);

  expect.assertions(2);
  try {
    await verifyAuth({}, context);
  } catch (e: any) {
    const [error] = e;
    expect(error.name).toBe("SemanticReleaseError");
    expect(error.code).toBe("EINVALIDNPMTOKEN");
  }
});

test("Valid token", async () => {
  const context = createContext();
  await fs.outputFile(
    resolve(context.cwd, ".yarnrc.yml"),
    yaml.dump({
      npmAuthToken: "valid",
    } as Yarnrc)
  );

  mockExeca(execa);

  await expect(verifyAuth({}, context)).resolves.toBe(undefined);
});
