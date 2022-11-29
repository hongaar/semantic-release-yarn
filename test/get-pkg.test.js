import test from "ava";
import fs from "fs-extra";
import { resolve } from "node:path";
import { directory } from "tempy";
import { getPkg } from "../dist/get-pkg.js";

test("Verify name and version then return parsed package.json", async (t) => {
  const cwd = directory();
  const pkg = { name: "package", version: "0.0.0" };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await getPkg({}, { cwd });
  t.is(pkg.name, result.name);
  t.is(pkg.version, result.version);
});

test("Verify name and version then return parsed package.json from a sub-directory", async (t) => {
  const cwd = directory();
  const pkgRoot = "dist";
  const pkg = { name: "package", version: "0.0.0" };
  await fs.outputJson(resolve(cwd, pkgRoot, "package.json"), pkg);

  const result = await getPkg({ pkgRoot }, { cwd });
  t.is(pkg.name, result.name);
  t.is(pkg.version, result.version);
});

test("Throw error if missing package.json", async (t) => {
  const cwd = directory();
  const [error] = await t.throwsAsync(getPkg({}, { cwd }));

  t.is(error.name, "SemanticReleaseError");
  t.is(error.code, "ENOPKG");
});

test("Throw error if missing package name", async (t) => {
  const cwd = directory();
  await fs.outputJson(resolve(cwd, "package.json"), { version: "0.0.0" });

  const [error] = await t.throwsAsync(getPkg({}, { cwd }));

  t.is(error.name, "SemanticReleaseError");
  t.is(error.code, "ENOPKGNAME");
});

test("Throw error if package.json is malformed", async (t) => {
  const cwd = directory();
  await fs.writeFile(resolve(cwd, "package.json"), "{name: 'package',}");

  const [error] = await t.throwsAsync(getPkg({}, { cwd }));

  t.is(error.name, "JSONError");
});
