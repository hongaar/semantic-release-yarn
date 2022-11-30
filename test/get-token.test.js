import test from "ava";
import { stub } from "sinon";
import { verifyConfig } from "../dist/get-token.js";

test.beforeEach((t) => {
  // Stub the logger functions
  t.context.log = stub();
  t.context.logger = { log: t.context.log };
});

test('Verify "npmPublish", "tarballDir" and "pkgRoot" options', async (t) => {
  t.deepEqual(
    verifyConfig(
      { npmPublish: true, tarballDir: "release", pkgRoot: "dist" },
      {},
      t.context.logger
    ),
    []
  );
});
