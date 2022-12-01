import fs from "fs-extra";
import { resolve } from "node:path";
import { directory } from "tempy";
import { getPkg } from "../src/get-pkg.js";

test("Verify name and version then return parsed package.json", async () => {
  const cwd = directory();
  const pkg = { name: "package", version: "0.0.0" };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await getPkg({}, { cwd });
  expect(pkg.name).toBe(result.name);
  expect(pkg.version).toBe(result.version);
});

test("Verify name and version then return parsed package.json from a sub-directory", async () => {
  const cwd = directory();
  const pkgRoot = "dist";
  const pkg = { name: "package", version: "0.0.0" };
  await fs.outputJson(resolve(cwd, pkgRoot, "package.json"), pkg);

  const result = await getPkg({ pkgRoot }, { cwd });
  expect(pkg.name).toBe(result.name);
  expect(pkg.version).toBe(result.version);
});

test.only("Throw error if missing package.json", async () => {
  const cwd = directory();

  expect.assertions(2);
  try {
    await getPkg({}, { cwd });
  } catch (error: any) {
    console.log(error);
    expect(error[0].name).toBe("SemanticReleaseError");
    expect(error[0].code).toBe("ENOPKG");
  }
});

test("Throw error if missing package name", async () => {
  const cwd = directory();
  await fs.outputJson(resolve(cwd, "package.json"), { version: "0.0.0" });

  expect.assertions(2);
  try {
    await getPkg({}, { cwd });
  } catch (error: any) {
    expect(error.name).toBe("SemanticReleaseError");
    expect(error.code).toBe("ENOPKGNAME");
  }
});

test("Throw error if package.json is malformed", async () => {
  const cwd = directory();
  await fs.writeFile(resolve(cwd, "package.json"), "{name: 'package',}");

  expect.assertions(1);
  try {
    await getPkg({}, { cwd });
  } catch (error: any) {
    expect(error.name).toBe("JSONError");
  }
});
