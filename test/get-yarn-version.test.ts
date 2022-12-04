import test from "ava";
import { createContext } from "./helpers/create-context.js";
// import { mockExeca } from "./helpers/create-execa-implementation.js";

test("Get Yarn version", async (t) => {
  const context = createContext();

  // mockExeca(execa, { stdout: "2.4.3" });

  t.is(await getYarnVersion(context), "2.4.3");
});

// test("Yarn not installed", async () => {
//   const context = createContext();

//   mockExecaError(execa);

//   expect.assertions(2);
//   try {
//     await getYarnVersion(context);
//   } catch (error: any) {
//     t.is(error.name, "Error");
//     expect(error.message).toBe(
//       "Could not determine Yarn version. Is Yarn installed?"
//     );
//   }
// });

// test("Yarn with empty output", async () => {
//   const context = createContext();

//   mockExeca(execa, { stdout: "" });

//   expect.assertions(2);
//   try {
//     await getYarnMajorVersion(context);
//   } catch (error: any) {
//     t.is(error.name, "Error");
//     expect(error.message).toBe(
//       'Could not determine Yarn major version, got ""'
//     );
//   }
// });

// test.each(["a.b.c", "invalid"])("Yarn invalid output (%s)", async (stdout) => {
//   const context = createContext();

//   mockExeca(execa, { stdout });

//   expect.assertions(2);
//   try {
//     await getYarnMajorVersion(context);
//   } catch (error: any) {
//     t.is(error.name, "Error");
//     expect(error.message).toBe(
//       `Could not determine Yarn major version, got "${stdout}"`
//     );
//   }
// });
