import { getReleaseInfo } from "../src/get-release-info.js";

test("Default registry and scoped module", () => {
  expect(
    getReleaseInfo(
      { name: "@scope/module" },
      { env: {}, nextRelease: { version: "1.0.0" } },
      "latest",
      "https://registry.npmjs.org/"
    )
  ).toEqual({
    name: "npm package (@latest dist-tag)",
    url: "https://www.npmjs.com/package/@scope/module/v/1.0.0",
    channel: "latest",
  });
});

test("Custom registry and scoped module", () => {
  expect(
    getReleaseInfo(
      { name: "@scope/module" },
      { env: {}, nextRelease: { version: "1.0.0" } },
      "latest",
      "https://custom.registry.org/"
    )
  ).toEqual({
    name: "npm package (@latest dist-tag)",
    url: undefined,
    channel: "latest",
  });
});
