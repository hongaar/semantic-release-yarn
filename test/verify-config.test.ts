import test from "ava";
import { verifyConfig } from "../src/verify-config.js";

test('Verify "npmPublish", "tarballDir" and "pkgRoot" options', async () => {
  expect(
    verifyConfig({ npmPublish: true, tarballDir: "release", pkgRoot: "dist" })
  ).toEqual([]);
});

test('Return SemanticReleaseError if "npmPublish" option is not a Boolean', async () => {
  const npmPublish = 42;
  const [error, ...errors] = verifyConfig({ npmPublish } as any);

  expect(errors).toHaveLength(0);
  t.is(error!.name, "SemanticReleaseError");
  t.is(error!.code, "EINVALIDNPMPUBLISH");
});

test('Return SemanticReleaseError if "tarballDir" option is not a String', async () => {
  const tarballDir = 42;
  const [error, ...errors] = verifyConfig({ tarballDir } as any);

  expect(errors).toHaveLength(0);
  t.is(error!.name, "SemanticReleaseError");
  t.is(error!.code, "EINVALIDTARBALLDIR");
});

test('Return SemanticReleaseError if "pkgRoot" option is not a String', async () => {
  const pkgRoot = 42;
  const [error, ...errors] = verifyConfig({ pkgRoot } as any);

  expect(errors).toHaveLength(0);
  t.is(error!.name, "SemanticReleaseError");
  t.is(error!.code, "EINVALIDPKGROOT");
});

test("Return SemanticReleaseError Array if multiple config are invalid", async () => {
  const npmPublish = 42;
  const tarballDir = 42;
  const pkgRoot = 42;
  const [error1, error2, error3] = verifyConfig({
    npmPublish,
    tarballDir,
    pkgRoot,
  } as any);

  t.is(error1!.name, "SemanticReleaseError");
  t.is(error1!.code, "EINVALIDNPMPUBLISH");

  t.is(error2!.name, "SemanticReleaseError");
  t.is(error2!.code, "EINVALIDTARBALLDIR");

  t.is(error3!.name, "SemanticReleaseError");
  t.is(error3!.code, "EINVALIDPKGROOT");
});
