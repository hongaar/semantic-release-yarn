import test from "ava";
import execa from "execa";
import fs from "fs-extra";
import { resolve } from "node:path";
import { stub } from "sinon";
import { WritableStreamBuffer } from "stream-buffers";
import { directory, file } from "tempy";
import { prepare } from "../dist/prepare.js";

test.beforeEach((t) => {
  t.context.log = stub();
  t.context.logger = { log: t.context.log };
  t.context.stdout = new WritableStreamBuffer();
  t.context.stderr = new WritableStreamBuffer();
});

test("Updade package.json", async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const packagePath = resolve(cwd, "package.json");
  await fs.outputJson(packagePath, { version: "0.0.0-dev" });

  await prepare(
    npmrc,
    {},
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json has been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");

  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd,
  ]);
});

test("Updade package.json and npm-shrinkwrap.json", async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const packagePath = resolve(cwd, "package.json");
  const shrinkwrapPath = resolve(cwd, "npm-shrinkwrap.json");
  await fs.outputJson(packagePath, { version: "0.0.0-dev" });
  // Create a npm-shrinkwrap.json file
  await execa("npm", ["shrinkwrap"], { cwd });

  await prepare(
    npmrc,
    {},
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json and npm-shrinkwrap.json have been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");
  t.is((await fs.readJson(shrinkwrapPath)).version, "1.0.0");
  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd,
  ]);
});

test("Updade package.json and package-lock.json", async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const packagePath = resolve(cwd, "package.json");
  const packageLockPath = resolve(cwd, "package-lock.json");
  await fs.outputJson(packagePath, { version: "0.0.0-dev" });
  await fs.appendFile(resolve(cwd, ".npmrc"), "package-lock = true");
  // Create a package-lock.json file
  await execa("npm", ["install"], { cwd });

  await prepare(
    npmrc,
    {},
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json and package-lock.json have been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");
  t.is((await fs.readJson(packageLockPath)).version, "1.0.0");
  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd,
  ]);
});

test("Updade package.json and npm-shrinkwrap.json in a sub-directory", async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const pkgRoot = "dist";
  const packagePath = resolve(cwd, pkgRoot, "package.json");
  const shrinkwrapPath = resolve(cwd, pkgRoot, "npm-shrinkwrap.json");
  await fs.outputJson(packagePath, { version: "0.0.0-dev" });
  // Create a npm-shrinkwrap.json file
  await execa("npm", ["shrinkwrap"], { cwd: resolve(cwd, pkgRoot) });

  await prepare(
    npmrc,
    { pkgRoot },
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json and npm-shrinkwrap.json have been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");
  t.is((await fs.readJson(shrinkwrapPath)).version, "1.0.0");
  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    resolve(cwd, pkgRoot),
  ]);
});

test("Updade package.json and package-lock.json in a sub-directory", async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const pkgRoot = "dist";
  const packagePath = resolve(cwd, pkgRoot, "package.json");
  const packageLockPath = resolve(cwd, pkgRoot, "package-lock.json");
  await fs.outputJson(packagePath, { version: "0.0.0-dev" });
  await fs.appendFile(resolve(cwd, pkgRoot, ".npmrc"), "package-lock = true");
  // Create a package-lock.json file
  await execa("npm", ["install"], { cwd: resolve(cwd, pkgRoot) });

  await prepare(
    npmrc,
    { pkgRoot },
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json and package-lock.json have been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");
  t.is((await fs.readJson(packageLockPath)).version, "1.0.0");
  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    resolve(cwd, pkgRoot),
  ]);
});

test("Preserve indentation and newline", async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const packagePath = resolve(cwd, "package.json");
  await fs.outputFile(
    packagePath,
    `{\r\n        "name": "package-name",\r\n        "version": "0.0.0-dev"\r\n}\r\n`
  );

  await prepare(
    npmrc,
    {},
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json has been updated
  t.is(
    await fs.readFile(packagePath, "utf-8"),
    `{\r\n        "name": "package-name",\r\n        "version": "1.0.0"\r\n}\r\n`
  );

  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd,
  ]);
});

test('Create the package in the "tarballDir" directory', async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const packagePath = resolve(cwd, "package.json");
  const pkg = { name: "my-pkg", version: "0.0.0-dev" };
  await fs.outputJson(packagePath, pkg);

  await prepare(
    npmrc,
    { tarballDir: "tarball" },
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json has been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");

  t.true(await fs.pathExists(resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)));
  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd,
  ]);
});

test('Only move the created tarball if the "tarballDir" directory is not the CWD', async (t) => {
  const cwd = directory();
  const npmrc = file({ name: ".npmrc" });
  const packagePath = resolve(cwd, "package.json");
  const pkg = { name: "my-pkg", version: "0.0.0-dev" };
  await fs.outputJson(packagePath, pkg);

  await prepare(
    npmrc,
    { tarballDir: "." },
    {
      cwd,
      env: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      nextRelease: { version: "1.0.0" },
      logger: t.context.logger,
    }
  );

  // Verify package.json has been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");

  t.true(await fs.pathExists(resolve(cwd, `${pkg.name}-1.0.0.tgz`)));
  // Verify the logger has been called with the version updated
  t.deepEqual(t.context.log.args[0], [
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd,
  ]);
});
