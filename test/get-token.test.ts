import test from "ava";
import { getToken } from "../src/get-token.js";

test("Get token from npmAuthToken", (t) => {
  t.is(
    getToken("https://registry.npmjs.org", { npmAuthToken: "token" }, {}),
    "token"
  );
});

test("Get token from environment variable", (t) => {
  t.is(
    getToken(
      "https://registry.npmjs.org",
      {},
      {
        env: {
          YARN_NPM_AUTH_TOKEN: "token",
        },
      }
    ),
    "token"
  );
});

test("Get token from registries list", (t) => {
  t.is(
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
    ),
    "token"
  );
});

test("Precedence: registries list > environment variable > npmAuthToken", (t) => {
  t.is(
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
    ),
    "token2"
  );
  t.is(
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
    ),
    "token3"
  );
});
