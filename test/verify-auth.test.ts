import test from "ava";
import fs from "fs-extra";
import yaml from "js-yaml";
import { resolve } from "node:path";
import "source-map-support/register.js";
import type { Yarnrc } from "../src/definitions/yarnrc.js";
import { verifyAuth } from "../src/verify-auth.js";
import { createContext } from "./helpers/create-context.js";
import {
  mockExeca,
  mockExecaError,
} from "./helpers/create-execa-implementation.js";

test.serial("No token", async (t) => {
  const context = createContext();
  await fs.outputFile(
    resolve(context.cwd, ".yarnrc.yml"),
    yaml.dump({} as Yarnrc)
  );

  const [error] = await t.throwsAsync<any>(verifyAuth({}, context));

  t.is(error.name, "SemanticReleaseError");
  t.is(error.code, "ENONPMTOKEN");
});

test.serial("Invalid token", async (t) => {
  const context = createContext();
  await fs.outputFile(
    resolve(context.cwd, ".yarnrc.yml"),
    yaml.dump({
      npmAuthToken: "invalid",
    } as Yarnrc)
  );

  mockExecaError();

  const [error] = await t.throwsAsync<any>(verifyAuth({}, context));

  t.is(error.name, "SemanticReleaseError");
  t.is(error.code, "EINVALIDNPMTOKEN");
});

test.serial("Valid token", async (t) => {
  const context = createContext();
  await fs.outputFile(
    resolve(context.cwd, ".yarnrc.yml"),
    yaml.dump({
      npmAuthToken: "valid",
    } as Yarnrc)
  );

  mockExeca();

  await t.notThrowsAsync(verifyAuth({}, context));
});
