import execa from "execa";
import fs from "fs-extra";
import yaml from "js-yaml";
import { resolve } from "node:path";
import type { Yarnrc } from "../src/definitions/yarnrc.js";
import { verifyAuth } from "../src/verify-auth.js";
import { createContext } from "./helpers/createContext.js";

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

  // @ts-ignore
  execa.mockImplementation(() => {
    const res = Promise.reject({
      exitCode: 1,
      failed: true,
    });
    // @ts-ignore
    res.stdout = { pipe: jest.fn() };
    // @ts-ignore
    res.stderr = { pipe: jest.fn() };
    return res;
  });

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

  // @ts-ignore
  execa.mockImplementation(() => {
    const res = Promise.resolve({
      exitCode: 0,
      failed: false,
    });
    // @ts-ignore
    res.stdout = { pipe: jest.fn() };
    // @ts-ignore
    res.stderr = { pipe: jest.fn() };
    return res;
  });

  expect.assertions(1);
  try {
    await verifyAuth({}, context);
    expect(true).toBe(true);
  } catch {}
});
