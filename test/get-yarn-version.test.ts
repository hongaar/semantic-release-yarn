import test from "ava";
import {
  getYarnMajorVersion,
  getYarnVersion,
} from "../src/get-yarn-version.js";
import { createContext } from "./helpers/create-context.js";
import {
  mockExeca,
  mockExecaError,
} from "./helpers/create-execa-implementation.js";

test.serial("Get Yarn version", async (t) => {
  const context = createContext();

  mockExeca({ stdout: "2.4.3" });

  t.is(await getYarnVersion(context), "2.4.3");
});

test.serial("Yarn not installed", async (t) => {
  const context = createContext();

  mockExecaError();

  const error = await t.throwsAsync<any>(getYarnVersion(context));

  t.is(error.name, "Error");
  t.is(error.message, "Could not determine Yarn version. Is Yarn installed?");
});

test.serial("Yarn with empty output", async (t) => {
  const context = createContext();

  mockExeca({ stdout: "" });

  const error = await t.throwsAsync<any>(getYarnMajorVersion(context));

  t.is(error.name, "Error");
  t.is(error.message, 'Could not determine Yarn major version, got ""');
});

test.serial("Yarn invalid output", async (t) => {
  const context = createContext();

  mockExeca({ stdout: "invalid" });

  const error = await t.throwsAsync<any>(getYarnMajorVersion(context));

  t.is(error.name, "Error");
  t.is(error.message, 'Could not determine Yarn major version, got "invalid"');
});
