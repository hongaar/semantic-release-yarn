import test from "ava";
import { verifyConfig } from "../src/verify-config.js";

test("Verify options", async (t) => {
  t.deepEqual(
    verifyConfig({
      npmPublish: true,
      tarballDir: "release",
      pkgRoot: "dist",
      mainWorkspace: "cli",
    }),
    [],
  );
});

test('Return SemanticReleaseError if "npmPublish" option is not a Boolean', async (t) => {
  const npmPublish = 42;
  const [error, ...errors] = verifyConfig({ npmPublish } as any);

  t.is(errors.length, 0);
  t.is(error!.name, "SemanticReleaseError");
  t.is(error!.code, "EINVALIDNPMPUBLISH");
});

test('Return SemanticReleaseError if "tarballDir" option is not a String', async (t) => {
  const tarballDir = 42;
  const [error, ...errors] = verifyConfig({ tarballDir } as any);

  t.is(errors.length, 0);
  t.is(error!.name, "SemanticReleaseError");
  t.is(error!.code, "EINVALIDTARBALLDIR");
});

test('Return SemanticReleaseError if "pkgRoot" option is not a String', async (t) => {
  const pkgRoot = 42;
  const [error, ...errors] = verifyConfig({ pkgRoot } as any);

  t.is(errors.length, 0);
  t.is(error!.name, "SemanticReleaseError");
  t.is(error!.code, "EINVALIDPKGROOT");
});

test('Return SemanticReleaseError if "mainWorkspace" option is not a String', async (t) => {
  const mainWorkspace = 42;
  const [error, ...errors] = verifyConfig({ mainWorkspace } as any);

  t.is(errors.length, 0);
  t.is(error!.name, "SemanticReleaseError");
  t.is(error!.code, "EINVALIDMAINWORKSPACE");
});

test("Return SemanticReleaseError Array if multiple config are invalid", async (t) => {
  const npmPublish = 42;
  const tarballDir = 42;
  const pkgRoot = 42;
  const mainWorkspace = 42;
  const errors = verifyConfig({
    npmPublish,
    tarballDir,
    pkgRoot,
    mainWorkspace,
  } as any);

  t.is(errors[0]!.name, "SemanticReleaseError");
  t.is(errors[0]!.code, "EINVALIDNPMPUBLISH");

  t.is(errors[1]!.name, "SemanticReleaseError");
  t.is(errors[1]!.code, "EINVALIDTARBALLDIR");

  t.is(errors[2]!.name, "SemanticReleaseError");
  t.is(errors[2]!.code, "EINVALIDPKGROOT");

  t.is(errors[3]!.name, "SemanticReleaseError");
  t.is(errors[3]!.code, "EINVALIDMAINWORKSPACE");
});
