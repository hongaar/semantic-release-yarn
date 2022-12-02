import fs from "fs-extra";
import { resolve } from "node:path";
// import { directory, file } from "tempy";
import { prepare } from "../src/prepare.js";
import { createContext } from "./helpers/createContext.js";

test("Update package.json", async () => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  await fs.outputJson(packagePath, { version: "0.0.0-dev" });

  await prepare(
    {},
    {
      ...context,
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0-dev" },
      nextRelease: { version: "1.0.0" },
    }
  );

  // Verify package.json has been updated
  expect((await fs.readJson(packagePath)).version).toBe("1.0.0");

  // Verify the logger has been called with the version plugin call
  expect(context.logger.log).toHaveBeenNthCalledWith(
    1,
    "Installing Yarn version plugin in %s",
    cwd
  );

  // Verify the logger has been called with the version updated
  expect(context.logger.log).toHaveBeenNthCalledWith(
    2,
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd
  );
});

test("Update package.json in a sub-directory", async () => {
  const context = createContext();
  const { cwd } = context;
  const pkgRoot = "dist";
  const packagePath = resolve(cwd, pkgRoot, "package.json");
  await fs.outputJson(packagePath, { version: "0.0.0-dev" });

  await prepare(
    { pkgRoot },
    {
      ...context,
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0-dev" },
      nextRelease: { version: "1.0.0" },
    }
  );

  // Verify package.json has been updated
  expect((await fs.readJson(packagePath)).version).toBe("1.0.0");

  // Verify the logger has been called with the version updated
  expect(context.logger.log).toHaveBeenNthCalledWith(
    2,
    "Write version %s to package.json in %s",
    "1.0.0",
    resolve(cwd, pkgRoot)
  );
});

test("Create the package tarball", async () => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  await fs.outputJson(packagePath, { name: "my-pkg", version: "0.0.0-dev" });

  await prepare(
    { tarballDir: "tarball" },
    {
      ...context,
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0-dev" },
      nextRelease: { version: "1.0.0" },
    }
  );

  // Verify package.json has been updated
  expect((await fs.readJson(packagePath)).version).toBe("1.0.0");

  // Verify the logger has been called with the version updated
  expect(context.logger.log).toHaveBeenNthCalledWith(
    2,
    "Write version %s to package.json in %s",
    "1.0.0",
    cwd
  );

  // Verify the package has been created in the "tarballDir" directory
  expect(await fs.pathExists(resolve(cwd, "tarball/my-pkg-1.0.0.tgz"))).toBe(
    true
  );

  // Verify the logger has been called with the version updated
  expect(context.logger.log).toHaveBeenNthCalledWith(
    3,
    "Creating package tarball in %s",
    "tarball"
  );
});

test("Create the package tarball in the current directory", async () => {
  const context = createContext();
  const { cwd } = context;
  const packagePath = resolve(cwd, "package.json");
  await fs.outputJson(packagePath, { name: "my-pkg", version: "0.0.0-dev" });

  await prepare(
    { tarballDir: "." },
    {
      ...context,
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0-dev" },
      nextRelease: { version: "1.0.0" },
    }
  );

  // Verify the package has been created in the "tarballDir" directory
  expect(await fs.pathExists(resolve(cwd, "my-pkg-1.0.0.tgz"))).toBe(true);

  // Verify the logger has been called with the version updated
  expect(context.logger.log).toHaveBeenNthCalledWith(
    3,
    "Creating package tarball in %s",
    "."
  );
});

test("Create the package tarball with package.json in sub-dir", async () => {
  const context = createContext();
  const { cwd } = context;
  const pkgRoot = "dist";
  const packagePath = resolve(cwd, pkgRoot, "package.json");
  await fs.outputJson(packagePath, { name: "my-pkg", version: "0.0.0-dev" });

  await prepare(
    { tarballDir: "tarball", pkgRoot },
    {
      ...context,
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0-dev" },
      nextRelease: { version: "1.0.0" },
    }
  );

  // Verify the package has been created in the "tarballDir" directory
  expect(await fs.pathExists(resolve(cwd, "tarball/my-pkg-1.0.0.tgz"))).toBe(
    true
  );
});
