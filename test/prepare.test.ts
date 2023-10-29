import test from "ava";
import { execa } from "execa";
import fs from "fs-extra";
import { resolve } from "node:path";
import { prepare } from "../src/prepare.js";
import { createContext } from "./helpers/create-context.js";

test("Update package.json", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  const pkg = { version: "0.0.0-dev" };
  await fs.outputJson(packagePath, pkg);

  await prepare({}, pkg, {
    ...context,
    releases: [],
    commits: [],
    lastRelease: { version: "0.0.0-dev" },
    nextRelease: { version: "1.0.0" },
  });

  // Verify package.json has been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");

  // Verify the logger has been called with the version updated
  t.deepEqual(context.logger.log.args[0], [
    'Write version "%s" to package.json in "%s"',
    "1.0.0",
    cwd,
  ]);
});

test("Update package.json in a sub-directory", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkgRoot = "dist";
  const packagePath = resolve(cwd, pkgRoot, "package.json");
  const pkg = { version: "0.0.0-dev" };

  await fs.outputJson(packagePath, pkg);

  await prepare({ pkgRoot }, pkg, {
    ...context,
    releases: [],
    commits: [],
    lastRelease: { version: "0.0.0-dev" },
    nextRelease: { version: "1.0.0" },
  });

  // Verify package.json has been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");

  // Verify the logger has been called with the version updated
  t.deepEqual(context.logger.log.args[0], [
    'Write version "%s" to package.json in "%s"',
    "1.0.0",
    resolve(cwd, pkgRoot),
  ]);
});

test("Create the package tarball", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  const pkg = { name: "my-pkg", version: "0.0.0-dev" };

  await fs.outputJson(packagePath, pkg);

  await prepare({ tarballDir: "tarball" }, pkg, {
    ...context,
    releases: [],
    commits: [],
    lastRelease: { version: "0.0.0-dev" },
    nextRelease: { version: "1.0.0" },
  });

  // Verify package.json has been updated
  t.is((await fs.readJson(packagePath)).version, "1.0.0");

  // Verify the logger has been called with the version updated
  t.deepEqual(context.logger.log.args[0], [
    'Write version "%s" to package.json in "%s"',
    "1.0.0",
    cwd,
  ]);

  // Verify the package has been created in the "tarballDir" directory
  t.true(await fs.pathExists(resolve(cwd, "tarball/my-pkg-1.0.0.tgz")));

  // Verify the logger has been called with the version updated
  t.deepEqual(context.logger.log.args[1], [
    'Creating package tarball in "%s"',
    "tarball",
  ]);
});

test("Create the package tarball in the current directory", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  const pkg = { name: "my-pkg", version: "0.0.0-dev" };
  await fs.outputJson(packagePath, pkg);

  await prepare({ tarballDir: "." }, pkg, {
    ...context,
    releases: [],
    commits: [],
    lastRelease: { version: "0.0.0-dev" },
    nextRelease: { version: "1.0.0" },
  });

  // Verify the package has been created in the "tarballDir" directory
  t.is(await fs.pathExists(resolve(cwd, "my-pkg-1.0.0.tgz")), true);

  // Verify the logger has been called with the version updated
  t.deepEqual(context.logger.log.args[1], [
    'Creating package tarball in "%s"',
    ".",
  ]);
});

test("Create the package tarball with package.json in sub-dir", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkgRoot = "dist";
  const packagePath = resolve(cwd, pkgRoot, "package.json");
  const pkg = { name: "my-pkg", version: "0.0.0-dev" };
  await fs.outputJson(packagePath, pkg);

  await prepare({ tarballDir: "tarball", pkgRoot }, pkg, {
    ...context,
    releases: [],
    commits: [],
    lastRelease: { version: "0.0.0-dev" },
    nextRelease: { version: "1.0.0" },
  });

  // Verify the package has been created in the "tarballDir" directory
  t.true(await fs.pathExists(resolve(cwd, "tarball/my-pkg-1.0.0.tgz")));
});

test("Update monorepo package.json files", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  const workspaceAPath = resolve(cwd, "workspace-a", "package.json");
  const workspaceBPath = resolve(cwd, "workspace-b", "package.json");
  const rootPkg = {
    private: true,
    workspaces: ["workspace-a", "workspace-b"],
  };
  await fs.outputJson(packagePath, rootPkg);
  await fs.outputJson(workspaceAPath, {
    name: "workspace-a",
    version: "0.0.0-dev",
  });
  await fs.outputJson(workspaceBPath, {
    name: "workspace-b",
    version: "0.0.0-dev",
  });
  await execa("yarn", ["install", "--no-immutable"], { cwd });

  await prepare({}, rootPkg, {
    ...context,
    releases: [],
    commits: [],
    lastRelease: { version: "0.0.0-dev" },
    nextRelease: { version: "1.0.0" },
  });

  // Verify root package.json has not been updated
  t.falsy((await fs.readJson(packagePath)).version);

  // Verify workspaces package.json has been updated
  t.is((await fs.readJson(workspaceAPath)).version, "1.0.0");
  t.is((await fs.readJson(workspaceBPath)).version, "1.0.0");

  // Verify the logger has been called with the version updated
  t.deepEqual(context.logger.log.args[0], [
    'Write version "%s" to package.json in "%s"',
    "1.0.0",
    cwd,
  ]);
});

test("Create the monorepo package tarballs", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  const workspaceAPath = resolve(cwd, "workspace-a", "package.json");
  const workspaceBPath = resolve(cwd, "workspace-b", "package.json");
  const rootPkg = {
    private: true,
    workspaces: ["workspace-a", "workspace-b"],
  };
  await fs.outputJson(packagePath, rootPkg);
  await fs.outputJson(workspaceAPath, {
    name: "workspace-a",
    version: "0.0.0-dev",
  });
  await fs.outputJson(workspaceBPath, {
    name: "workspace-b",
    version: "0.0.0-dev",
  });
  await execa("yarn", ["install", "--no-immutable"], { cwd });

  await prepare({ tarballDir: "." }, rootPkg, {
    ...context,
    releases: [],
    commits: [],
    lastRelease: { version: "0.0.0-dev" },
    nextRelease: { version: "1.0.0" },
  });

  // Verify the package has been created in the "tarballDir" directory
  t.is(await fs.pathExists(resolve(cwd, "workspace-a-1.0.0.tgz")), true);
  t.is(await fs.pathExists(resolve(cwd, "workspace-b-1.0.0.tgz")), true);

  // Verify the logger has been called with the version updated
  t.deepEqual(context.logger.log.args[1], [
    'Creating package tarball in "%s"',
    ".",
  ]);
});
