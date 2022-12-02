import execa from "execa";
import { verifyYarn } from "../src/verify-yarn.js";
import { createContext } from "./helpers/create-context.js";
import { mockExeca } from "./helpers/create-execa-implementation.js";

jest.mock("execa");

test("Yarn (1.20.19)", async () => {
  const context = createContext();

  mockExeca(execa, { stdout: "1.20.19" });

  expect.assertions(2);
  try {
    await verifyYarn(context);
  } catch (e: any) {
    const [error] = e;
    expect(error.name).toBe("SemanticReleaseError");
    expect(error.code).toBe("EINVALIDYARN");
  }
});

test.each(["2.4.3", "3.3.0", "4.0.0"])("Yarn (%s)", async (stdout) => {
  const context = createContext();

  mockExeca(execa, { stdout });

  await expect(verifyYarn(context)).resolves.toBe(undefined);
});
