import { getToken } from "../src/get-token.js";

test("Get token from npmAuthToken", async () => {
  expect(
    getToken("https://registry.npmjs.org", { npmAuthToken: "token" }, {})
  ).toBe("token");
});

test("Get token from environment variable", async () => {
  expect(
    getToken(
      "https://registry.npmjs.org",
      {},
      {
        env: {
          YARN_NPM_AUTH_TOKEN: "token",
        },
      }
    )
  ).toBe("token");
});

test("Get token from registries list", async () => {
  expect(
    getToken(
      "https://registry.npmjs.org",
      {
        npmRegistries: {
          "//registry.npmjs.org/": {
            npmAuthToken: "token",
          },
        },
      },
      {}
    )
  ).toBe("token");
});

test("Precedence: registries list > environment variable > npmAuthToken", async () => {
  expect(
    getToken(
      "https://registry.npmjs.org",
      {
        npmAuthToken: "token1",
        npmRegistries: {
          "//registry.npmjs.org/": {
            npmAuthToken: "token2",
          },
        },
      },
      {
        env: {
          YARN_NPM_AUTH_TOKEN: "token3",
        },
      }
    )
  ).toBe("token2");
  expect(
    getToken(
      "https://registry.npmjs.org",
      {
        npmAuthToken: "token1",
      },
      {
        env: {
          YARN_NPM_AUTH_TOKEN: "token3",
        },
      }
    )
  ).toBe("token3");
});
