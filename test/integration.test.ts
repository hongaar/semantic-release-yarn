import test from "ava";
import { execa } from "execa";
import fs from "fs-extra";
import { resolve } from "node:path";
import { defaultRegistries } from "../src/definitions/constants.js";
import { createContext } from "./helpers/create-context.js";
import { getPackageTags, getPackageVersion } from "./helpers/npm-info.js";
import { authEnv, start, stop, url } from "./helpers/npm-registry.js";

let mod: typeof import("../src/index.js");

// Environment variables used only for the local npm command used to do verification
const testEnv = {
  ...process.env,
  ...authEnv,
};

test.before(async () => {
  // Start the local NPM registry
  await start();

  // Add testing registry to list of default registries
  defaultRegistries.push(url);
});

test.after.always(async () => {
  // Stop the local NPM registry
  await stop();
});

test.beforeEach(async () => {
  // With cache bust to refresh the module state
  mod = await import(
    `../src/index.js?update=${new Date()}-${new Date().getMilliseconds()}`
  );
});

test('Skip npm auth verification if "npmPublish" is false', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = { YARN_NPM_AUTH_TOKEN: "wrong_token" };
  const pkg = {
    name: "published",
    version: "1.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await t.notThrowsAsync(
    mod.verifyConditions(
      { npmPublish: false },
      {
        ...context,
        env,
      }
    )
  );
});

test('Skip npm auth verification if "package.private" is true', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkg = {
    name: "published",
    version: "1.0.0",
    publishConfig: { registry: url },
    private: true,
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await t.notThrowsAsync(
    mod.verifyConditions(
      {},
      {
        ...context,
        options: { publish: ["semantic-release-yarn"] },
      }
    )
  );
});

test("Throws error if NPM token is invalid", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = {
    YARN_NPM_AUTH_TOKEN: "wrong_token",
  };
  const pkg = {
    name: "published",
    version: "1.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const {
    errors: [error],
  } = await t.throwsAsync<any>(
    mod.verifyConditions(
      {},
      {
        ...context,
        env,
        options: {},
      }
    )
  );

  t.is(error.name, "SemanticReleaseError");
  t.is(error.code, "EINVALIDNPMTOKEN");
});

test("Skip auth validation if the registry configured is not the default one", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = { YARN_NPM_AUTH_TOKEN: "wrong_token" };
  const pkg = {
    name: "published",
    version: "1.0.0",
    publishConfig: { registry: "http://custom-registry.com/" },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await t.notThrowsAsync(
    mod.verifyConditions(
      {},
      {
        ...context,
        env,
        options: {},
      }
    )
  );
});

test("Verify npm auth and package", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkg = {
    name: "valid-token",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await t.notThrowsAsync(
    mod.verifyConditions(
      {},
      {
        ...context,
        env: authEnv,
        options: {},
      }
    )
  );
});

test("Verify npm auth and package from a sub-directory", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkg = {
    name: "valid-token",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "dist/package.json"), pkg);

  await t.notThrowsAsync(
    mod.verifyConditions(
      { pkgRoot: "dist" },
      {
        ...context,
        env: authEnv,
        options: {},
      }
    )
  );
});

test("Throw SemanticReleaseError Array if config option are not valid in verifyConditions", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkg = { publishConfig: { registry: url } };

  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const npmPublish = 42;
  const tarballDir = 42;
  const pkgRoot = 42;

  const { errors } = await t.throwsAsync<any>(
    mod.verifyConditions(
      {},
      {
        ...context,
        env: {},
        options: {
          publish: [
            "@semantic-release/github",
            {
              path: "semantic-release-yarn",
              npmPublish,
              tarballDir,
              pkgRoot,
            },
          ],
        },
      }
    )
  );

  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EINVALIDNPMPUBLISH");
  t.is(errors[1].name, "SemanticReleaseError");
  t.is(errors[1].code, "EINVALIDTARBALLDIR");
  t.is(errors[2].name, "SemanticReleaseError");
  t.is(errors[2].code, "EINVALIDPKGROOT");
  t.is(errors[3].name, "SemanticReleaseError");
  t.is(errors[3].code, "ENOPKG");
});

test("Publish the package", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "publish",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/publish/v/1.0.0",
    channel: "latest",
  });
  t.is((await fs.readJson(resolve(cwd, "package.json"))).version, "1.0.0");
  t.false(await fs.pathExists(resolve(cwd, `${pkg.name}-1.0.0.tgz`)));
  t.is(await getPackageVersion(pkg.name, { cwd, env: testEnv }), "1.0.0");
});

test("Publish the package on a dist-tag", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = { ...authEnv };
  const pkg = {
    name: "publish-tag",
    version: "0.0.0",
    publishConfig: { registry: url, tag: "next" },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { channel: "next", version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@next dist-tag)",
    url: "https://www.npmjs.com/package/publish-tag/v/1.0.0",
    channel: "next",
  });
  t.is((await fs.readJson(resolve(cwd, "package.json"))).version, "1.0.0");
  t.false(await fs.pathExists(resolve(cwd, `${pkg.name}-1.0.0.tgz`)));
  t.is(await getPackageVersion(pkg.name, { cwd, env: testEnv }), "1.0.0");
});

test("Publish the package from a sub-directory", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "publish-sub-dir",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "dist/package.json"), pkg);

  const result = await mod.publish(
    { pkgRoot: "dist" },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/publish-sub-dir/v/1.0.0",
    channel: "latest",
  });
  t.is((await fs.readJson(resolve(cwd, "dist/package.json"))).version, "1.0.0");
  t.false(await fs.pathExists(resolve(cwd, `${pkg.name}-1.0.0.tgz`)));
  t.is(
    await getPackageVersion(pkg.name, {
      cwd: resolve(cwd, "dist"),
      env: testEnv,
    }),
    "1.0.0"
  );
});

test('Create the package and skip publish ("npmPublish" is false)', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "skip-publish",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await mod.publish(
    { npmPublish: false, tarballDir: "tarball" },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.false(result);
  t.is((await fs.readJson(resolve(cwd, "package.json"))).version, "1.0.0");
  t.true(await fs.pathExists(resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)));
  await t.throwsAsync(getPackageVersion(pkg.name, { cwd, env: testEnv }));
});

test('Create the package and skip publish ("package.private" is true)', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "skip-publish-private",
    version: "0.0.0",
    publishConfig: { registry: url },
    private: true,
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await mod.publish(
    { tarballDir: "tarball" },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.false(result);
  t.is((await fs.readJson(resolve(cwd, "package.json"))).version, "1.0.0");
  t.true(await fs.pathExists(resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)));
  await t.throwsAsync(getPackageVersion(pkg.name, { cwd, env: testEnv }));
});

test('Create the package and skip publish from a sub-directory ("npmPublish" is false)', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "skip-publish-sub-dir",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "dist/package.json"), pkg);

  const result = await mod.publish(
    { npmPublish: false, tarballDir: "./tarball", pkgRoot: "./dist" },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.false(result);
  t.is((await fs.readJson(resolve(cwd, "dist/package.json"))).version, "1.0.0");
  t.true(await fs.pathExists(resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)));
  await t.throwsAsync(getPackageVersion(pkg.name, { cwd, env: testEnv }));
});

test('Create the package and skip publish from a sub-directory ("package.private" is true)', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "skip-publish-sub-dir-private",
    version: "0.0.0",
    publishConfig: { registry: url },
    private: true,
  };
  await fs.outputJson(resolve(cwd, "dist/package.json"), pkg);

  const result = await mod.publish(
    { tarballDir: "./tarball", pkgRoot: "./dist" },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.false(result);
  t.is((await fs.readJson(resolve(cwd, "dist/package.json"))).version, "1.0.0");
  t.true(await fs.pathExists(resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)));
  await t.throwsAsync(getPackageVersion(pkg.name, { cwd, env: testEnv }));
});

test("Throw SemanticReleaseError Array if config option are not valid in publish", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkg = { publishConfig: { registry: url } };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const npmPublish = 42 as any;
  const tarballDir = 42 as any;
  const pkgRoot = 42 as any;

  const { errors } = await t.throwsAsync<any>(
    mod.publish(
      { npmPublish, tarballDir, pkgRoot },
      {
        ...context,
        env: {},
        options: {
          publish: ["@semantic-release/github", "semantic-release-yarn"],
        },
        releases: [],
        commits: [],
        lastRelease: { version: "0.0.0" },
        nextRelease: { version: "1.0.0" },
      }
    )
  );

  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EINVALIDNPMPUBLISH");
  t.is(errors[1].name, "SemanticReleaseError");
  t.is(errors[1].code, "EINVALIDTARBALLDIR");
  t.is(errors[2].name, "SemanticReleaseError");
  t.is(errors[2].code, "EINVALIDPKGROOT");
  t.is(errors[3].name, "SemanticReleaseError");
  t.is(errors[3].code, "ENOPKG");
});

test("Prepare the package", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "prepare",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await mod.prepare(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.is((await fs.readJson(resolve(cwd, "package.json"))).version, "1.0.0");
  t.false(await fs.pathExists(resolve(cwd, `${pkg.name}-1.0.0.tgz`)));
});

test("Prepare the package from a sub-directory", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "prepare-sub-dir",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "dist/package.json"), pkg);

  await mod.prepare(
    { pkgRoot: "dist" },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.is((await fs.readJson(resolve(cwd, "dist/package.json"))).version, "1.0.0");
  t.false(await fs.pathExists(resolve(cwd, `${pkg.name}-1.0.0.tgz`)));
});

test("Throw SemanticReleaseError Array if config option are not valid in prepare", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const pkg = { publishConfig: { registry: url } };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const npmPublish = 42 as any;
  const tarballDir = 42 as any;
  const pkgRoot = 42 as any;

  const { errors } = await t.throwsAsync<any>(
    mod.prepare(
      { npmPublish, tarballDir, pkgRoot },
      {
        ...context,
        env: {},
        options: {
          publish: ["@semantic-release/github", "semantic-release-yarn"],
        },
        releases: [],
        commits: [],
        lastRelease: { version: "0.0.0" },
        nextRelease: { version: "1.0.0" },
      }
    )
  );

  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EINVALIDNPMPUBLISH");
  t.is(errors[1].name, "SemanticReleaseError");
  t.is(errors[1].code, "EINVALIDTARBALLDIR");
  t.is(errors[2].name, "SemanticReleaseError");
  t.is(errors[2].code, "EINVALIDPKGROOT");
  t.is(errors[3].name, "SemanticReleaseError");
  t.is(errors[3].code, "ENOPKG");
});

test("Publish the package and add to default dist-tag", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "add-channel",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { channel: "next", version: "1.0.0" },
    }
  );

  const result = await mod.addChannel(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      currentRelease: { version: "1.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/add-channel/v/1.0.0",
    channel: "latest",
  });
  t.is((await getPackageTags(pkg.name, { cwd, env }))["latest"], "1.0.0");
});

test("Publish the package and add to lts dist-tag", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "add-channel-legacy",
    version: "1.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { channel: "latest", version: "1.0.0" },
    }
  );

  const result = await mod.addChannel(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      currentRelease: { version: "1.0.0" },
      nextRelease: { channel: "1.x", version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@release-1.x dist-tag)",
    url: "https://www.npmjs.com/package/add-channel-legacy/v/1.0.0",
    channel: "release-1.x",
  });
  t.is((await getPackageTags(pkg.name, { cwd, env }))["latest"], "1.0.0");
  t.is((await getPackageTags(pkg.name, { cwd, env }))["release-1.x"], "1.0.0");
});

test('Skip adding the package to a channel ("npmPublish" is false)', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "skip-add-channel",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await mod.addChannel(
    { npmPublish: false },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      currentRelease: { version: "1.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.false(result);
  await t.throwsAsync(getPackageVersion(pkg.name, { cwd, env }));
});

test('Skip adding the package to a channel ("package.private" is true)', async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "skip-add-channel-private",
    version: "0.0.0",
    publishConfig: { registry: url },
    private: true,
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const result = await mod.addChannel(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      currentRelease: { version: "1.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.false(result);
  await t.throwsAsync(getPackageVersion(pkg.name, { cwd, env }));
});

test("Create the package in addChannel step", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "add-channel-pkg",
    version: "0.0.0",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await mod.prepare(
    { npmPublish: false, tarballDir: "tarball" },
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.is((await fs.readJson(resolve(cwd, "package.json"))).version, "1.0.0");
  t.true(await fs.pathExists(resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)));
});

test("Throw SemanticReleaseError Array if config option are not valid in addChannel", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = { publishConfig: { registry: url } };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  const npmPublish = 42 as any;
  const tarballDir = 42 as any;
  const pkgRoot = 42 as any;

  const { errors } = await t.throwsAsync<any>(
    mod.addChannel(
      { npmPublish, tarballDir, pkgRoot },
      {
        ...context,
        env,
        options: {
          publish: ["@semantic-release/github", "semantic-release-yarn"],
        },
        releases: [],
        commits: [],
        lastRelease: { version: "0.0.0" },
        currentRelease: { version: "1.0.0" },
        nextRelease: { version: "1.0.0" },
      }
    )
  );

  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EINVALIDNPMPUBLISH");
  t.is(errors[1].name, "SemanticReleaseError");
  t.is(errors[1].code, "EINVALIDTARBALLDIR");
  t.is(errors[2].name, "SemanticReleaseError");
  t.is(errors[2].code, "EINVALIDPKGROOT");
  t.is(errors[3].name, "SemanticReleaseError");
  t.is(errors[3].code, "ENOPKG");
});

test("Verify token and set up auth only on the fist call, then prepare on prepare call only", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const pkg = {
    name: "test-module",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  };
  await fs.outputJson(resolve(cwd, "package.json"), pkg);

  await t.notThrowsAsync(
    mod.verifyConditions(
      {},
      {
        ...context,
        env,
        options: {},
      }
    )
  );
  await mod.prepare(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  let result = await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { channel: "next", version: "1.0.0" },
    }
  );
  t.deepEqual(result, {
    name: "npm package (@next dist-tag)",
    url: "https://www.npmjs.com/package/test-module/v/1.0.0",
    channel: "next",
  });
  t.is((await getPackageTags(pkg.name, { cwd, env }))["next"], "1.0.0");

  result = await mod.addChannel(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      currentRelease: { version: "1.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/test-module/v/1.0.0",
    channel: "latest",
  });
  t.is((await getPackageTags(pkg.name, { cwd, env }))["latest"], "1.0.0");
});

test("Publish monorepo packages", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const packagePath = resolve(cwd, "package.json");
  const workspaceAPath = resolve(cwd, "workspace-a", "package.json");
  const workspaceBPath = resolve(cwd, "workspace-b", "package.json");
  await fs.outputJson(packagePath, {
    name: "monorepo",
    private: true,
    workspaces: ["workspace-a", "workspace-b"],
  });
  await fs.outputJson(workspaceAPath, {
    name: "monorepo-workspace-a",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await fs.outputJson(workspaceBPath, {
    name: "monorepo-workspace-b",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await execa("yarn", ["install", "--no-immutable"], { cwd });

  const result = await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  // @todo: how to reflect each workspace in the result?
  t.deepEqual(result, {
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/monorepo/v/1.0.0",
    channel: "latest",
  });
  t.falsy((await fs.readJson(packagePath)).version);
  t.is((await fs.readJson(workspaceAPath)).version, "1.0.0");
  t.is((await fs.readJson(workspaceBPath)).version, "1.0.0");
  t.false(await fs.pathExists(resolve(cwd, `monorepo-1.0.0.tgz`)));
  t.false(await fs.pathExists(resolve(cwd, `monorepo-workspace-a-1.0.0.tgz`)));
  t.false(await fs.pathExists(resolve(cwd, `monorepo-workspace-b-1.0.0.tgz`)));
  await t.throwsAsync(getPackageVersion("monorepo", { cwd, env: testEnv }));
  t.is(
    await getPackageVersion("monorepo-workspace-a", { cwd, env: testEnv }),
    "1.0.0"
  );
  t.is(
    await getPackageVersion("monorepo-workspace-b", { cwd, env: testEnv }),
    "1.0.0"
  );
});

test("Publish non-private monorepo packages", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const packagePath = resolve(cwd, "package.json");
  const workspaceAPath = resolve(cwd, "workspace-a", "package.json");
  const workspaceBPath = resolve(cwd, "workspace-b", "package.json");
  await fs.outputJson(packagePath, {
    name: "monorepo-non-private",
    version: "0.0.0-dev",
    workspaces: ["workspace-a", "workspace-b"],
  });
  await fs.outputJson(workspaceAPath, {
    name: "monorepo-non-private-workspace-a",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await fs.outputJson(workspaceBPath, {
    name: "monorepo-non-private-workspace-b",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await execa("yarn", ["install", "--no-immutable"], { cwd });

  const result = await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  // @todo: how to reflect each workspace in the result?
  t.deepEqual(result, {
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/monorepo-non-private/v/1.0.0",
    channel: "latest",
  });
  t.is((await fs.readJson(packagePath)).version, "1.0.0");
  t.is((await fs.readJson(workspaceAPath)).version, "1.0.0");
  t.is((await fs.readJson(workspaceBPath)).version, "1.0.0");
  t.false(await fs.pathExists(resolve(cwd, `monorepo-non-private-1.0.0.tgz`)));
  t.false(
    await fs.pathExists(
      resolve(cwd, `monorepo-non-private-workspace-a-1.0.0.tgz`)
    )
  );
  t.false(
    await fs.pathExists(
      resolve(cwd, `monorepo-non-private-workspace-b-1.0.0.tgz`)
    )
  );
  t.is(
    await getPackageVersion("monorepo-non-private", { cwd, env: testEnv }),
    "1.0.0"
  );
  t.is(
    await getPackageVersion("monorepo-non-private-workspace-a", {
      cwd,
      env: testEnv,
    }),
    "1.0.0"
  );
  t.is(
    await getPackageVersion("monorepo-non-private-workspace-b", {
      cwd,
      env: testEnv,
    }),
    "1.0.0"
  );
});

test("Publish monorepo packages on a dist-tag", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = { ...authEnv };
  const packagePath = resolve(cwd, "package.json");
  const workspaceAPath = resolve(cwd, "workspace-a", "package.json");
  const workspaceBPath = resolve(cwd, "workspace-b", "package.json");
  await fs.outputJson(packagePath, {
    name: "monorepo-publish-tag",
    private: true,
    workspaces: ["workspace-a", "workspace-b"],
  });
  await fs.outputJson(workspaceAPath, {
    name: "monorepo-publish-tag-workspace-a",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await fs.outputJson(workspaceBPath, {
    name: "monorepo-publish-tag-workspace-b",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await execa("yarn", ["install", "--no-immutable"], { cwd });

  const result = await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { channel: "next", version: "1.0.0" },
    }
  );

  // @todo: how to reflect each workspace in the result?
  t.deepEqual(result, {
    name: "npm package (@next dist-tag)",
    url: "https://www.npmjs.com/package/monorepo-publish-tag/v/1.0.0",
    channel: "next",
  });
  t.falsy((await fs.readJson(resolve(cwd, "package.json"))).version);
  t.false(await fs.pathExists(resolve(cwd, `monorepo-publish-tag-1.0.0.tgz`)));
  t.false(
    await fs.pathExists(
      resolve(cwd, `monorepo-publish-tag-workspace-a-1.0.0.tgz`)
    )
  );
  t.false(
    await fs.pathExists(
      resolve(cwd, `monorepo-publish-tag-workspace-b-1.0.0.tgz`)
    )
  );
  await t.throwsAsync(
    getPackageVersion("monorepo-publish-tag", { cwd, env: testEnv })
  );
  t.is(
    await getPackageVersion("monorepo-publish-tag-workspace-a", {
      cwd,
      env: testEnv,
    }),
    "1.0.0"
  );
  t.is(
    await getPackageVersion("monorepo-publish-tag-workspace-b", {
      cwd,
      env: testEnv,
    }),
    "1.0.0"
  );
});

test("Publish monorepo packages and add to default dist-tag", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const packagePath = resolve(cwd, "package.json");
  const workspaceAPath = resolve(cwd, "workspace-a", "package.json");
  const workspaceBPath = resolve(cwd, "workspace-b", "package.json");
  await fs.outputJson(packagePath, {
    name: "monorepo-add-channel",
    private: true,
    workspaces: ["workspace-a", "workspace-b"],
  });
  await fs.outputJson(workspaceAPath, {
    name: "monorepo-add-channel-workspace-a",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await fs.outputJson(workspaceBPath, {
    name: "monorepo-add-channel-workspace-b",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await execa("yarn", ["install", "--no-immutable"], { cwd });

  await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { channel: "next", version: "1.0.0" },
    }
  );

  const result = await mod.addChannel(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      currentRelease: { version: "1.0.0" },
      nextRelease: { version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/monorepo-add-channel/v/1.0.0",
    channel: "latest",
  });
  await t.throwsAsync(getPackageTags("monorepo-add-channel", { cwd, env }));
  t.is(
    (await getPackageTags("monorepo-add-channel-workspace-a", { cwd, env }))[
      "latest"
    ],
    "1.0.0"
  );
  t.is(
    (await getPackageTags("monorepo-add-channel-workspace-b", { cwd, env }))[
      "latest"
    ],
    "1.0.0"
  );
});

test("Publish monorepo packages and add to lts dist-tag", async (t) => {
  const context = createContext();
  const { cwd } = context;
  const env = authEnv;
  const packagePath = resolve(cwd, "package.json");
  const workspaceAPath = resolve(cwd, "workspace-a", "package.json");
  const workspaceBPath = resolve(cwd, "workspace-b", "package.json");
  await fs.outputJson(packagePath, {
    name: "monorepo-add-channel-legacy",
    private: true,
    workspaces: ["workspace-a", "workspace-b"],
  });
  await fs.outputJson(workspaceAPath, {
    name: "monorepo-add-channel-legacy-workspace-a",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await fs.outputJson(workspaceBPath, {
    name: "monorepo-add-channel-legacy-workspace-b",
    version: "0.0.0-dev",
    publishConfig: { registry: url },
  });
  await execa("yarn", ["install", "--no-immutable"], { cwd });

  await mod.publish(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      nextRelease: { channel: "latest", version: "1.0.0" },
    }
  );

  const result = await mod.addChannel(
    {},
    {
      ...context,
      env,
      options: {},
      releases: [],
      commits: [],
      lastRelease: { version: "0.0.0" },
      currentRelease: { version: "1.0.0" },
      nextRelease: { channel: "1.x", version: "1.0.0" },
    }
  );

  t.deepEqual(result, {
    name: "npm package (@release-1.x dist-tag)",
    url: "https://www.npmjs.com/package/monorepo-add-channel-legacy/v/1.0.0",
    channel: "release-1.x",
  });
  await t.throwsAsync(
    getPackageTags("monorepo-add-channel-legacy", { cwd, env })
  );
  t.is(
    (
      await getPackageTags("monorepo-add-channel-legacy-workspace-a", {
        cwd,
        env,
      })
    )["latest"],
    "1.0.0"
  );
  t.is(
    (
      await getPackageTags("monorepo-add-channel-legacy-workspace-b", {
        cwd,
        env,
      })
    )["latest"],
    "1.0.0"
  );
  t.is(
    (
      await getPackageTags("monorepo-add-channel-legacy-workspace-a", {
        cwd,
        env,
      })
    )["release-1.x"],
    "1.0.0"
  );
  t.is(
    (
      await getPackageTags("monorepo-add-channel-legacy-workspace-b", {
        cwd,
        env,
      })
    )["release-1.x"],
    "1.0.0"
  );
});
