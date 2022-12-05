import test from "ava";
import { verifyYarn } from "../src/verify-yarn.js";
import { createContext } from "./helpers/create-context.js";
import { mockExeca } from "./helpers/create-execa-implementation.js";

test.serial("Yarn (1.20.19)", async (t) => {
  const context = createContext();

  mockExeca({ stdout: "1.20.19" });

  const {
    errors: [error],
  } = await t.throwsAsync<any>(verifyYarn(context));

  t.is(error.name, "SemanticReleaseError");
  t.is(error.code, "EINVALIDYARN");
});

test.serial("Yarn (2.4.3)", async (t) => {
  const context = createContext();

  mockExeca({ stdout: "2.4.3" });

  await t.notThrowsAsync(verifyYarn(context));
});
