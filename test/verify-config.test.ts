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
  expect(error!.name).toBe("SemanticReleaseError");
  expect(error!.code).toBe("EINVALIDNPMPUBLISH");
});

test('Return SemanticReleaseError if "tarballDir" option is not a String', async () => {
  const tarballDir = 42;
  const [error, ...errors] = verifyConfig({ tarballDir } as any);

  expect(errors).toHaveLength(0);
  expect(error!.name).toBe("SemanticReleaseError");
  expect(error!.code).toBe("EINVALIDTARBALLDIR");
});

test('Return SemanticReleaseError if "pkgRoot" option is not a String', async () => {
  const pkgRoot = 42;
  const [error, ...errors] = verifyConfig({ pkgRoot } as any);

  expect(errors).toHaveLength(0);
  expect(error!.name).toBe("SemanticReleaseError");
  expect(error!.code).toBe("EINVALIDPKGROOT");
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

  expect(error1!.name).toBe("SemanticReleaseError");
  expect(error1!.code).toBe("EINVALIDNPMPUBLISH");

  expect(error2!.name).toBe("SemanticReleaseError");
  expect(error2!.code).toBe("EINVALIDTARBALLDIR");

  expect(error3!.name).toBe("SemanticReleaseError");
  expect(error3!.code).toBe("EINVALIDPKGROOT");
});
