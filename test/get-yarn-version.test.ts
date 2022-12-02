import execa from "execa";
import {
  getYarnMajorVersion,
  getYarnVersion,
} from "../src/get-yarn-version.js";
import { createContext } from "./helpers/create-context.js";
import {
  mockExeca,
  mockExecaError,
} from "./helpers/create-execa-implementation.js";

jest.mock("execa");

test.each(["1.22.19", "2.4.3", "3.3.0"])(
  "Get Yarn version (%s)",
  async (stdout) => {
    const context = createContext();

    mockExeca(execa, { stdout });

    expect(await getYarnVersion(context)).toBe(stdout);
  }
);

test("Yarn not installed", async () => {
  const context = createContext();

  mockExecaError(execa);

  expect.assertions(2);
  try {
    await getYarnVersion(context);
  } catch (error: any) {
    expect(error.name).toBe("Error");
    expect(error.message).toBe(
      "Could not determine Yarn version. Is Yarn installed?"
    );
  }
});

test("Yarn with empty output", async () => {
  const context = createContext();

  mockExeca(execa, { stdout: "" });

  expect.assertions(2);
  try {
    await getYarnMajorVersion(context);
  } catch (error: any) {
    expect(error.name).toBe("Error");
    expect(error.message).toBe(
      'Could not determine Yarn major version, got ""'
    );
  }
});

test.each(["a.b.c", "invalid"])("Yarn invalid output (%s)", async (stdout) => {
  const context = createContext();

  mockExeca(execa, { stdout });

  expect.assertions(2);
  try {
    await getYarnMajorVersion(context);
  } catch (error: any) {
    expect(error.name).toBe("Error");
    expect(error.message).toBe(
      `Could not determine Yarn major version, got "${stdout}"`
    );
  }
});
