import test from "ava";
import { getToken } from "../src/get-token.js";
import { createContext } from "./helpers/create-context.js";

test("Get token from npmAuthToken", (t) => {
  const context = createContext();

  t.is(
    getToken("https://registry.npmjs.org", { npmAuthToken: "token" }, context),
    "token",
  );
});

test("Get token from environment variable", (t) => {
  const context = createContext();

  t.is(
    getToken(
      "https://registry.npmjs.org",
      {},
      {
        ...context,
        env: {
          YARN_NPM_AUTH_TOKEN: "token",
        },
      },
    ),
    "token",
  );
});

test("Get token from registries list", (t) => {
  const context = createContext();

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
      context,
    ),
    "token",
  );
});

test("Precedence: registries list > environment variable > npmAuthToken", (t) => {
  const context = createContext();

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
        ...context,
        env: {
          YARN_NPM_AUTH_TOKEN: "token3",
        },
      },
    ),
    "token2",
  );
  t.is(
    getToken(
      "https://registry.npmjs.org",
      {
        npmAuthToken: "token1",
      },
      {
        ...context,
        env: {
          YARN_NPM_AUTH_TOKEN: "token3",
        },
      },
    ),
    "token3",
  );
});
