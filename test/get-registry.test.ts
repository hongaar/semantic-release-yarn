import test from "ava";
import { getRegistry } from "../src/get-registry.js";
import { createContext } from "./helpers/create-context.js";

test("Get default registry", async (t) => {
  const context = createContext();

  t.is(getRegistry({}, {}, context), "https://registry.npmjs.org");
  t.is(
    getRegistry({ publishConfig: {} }, {}, context),
    "https://registry.npmjs.org"
  );
  t.is(
    getRegistry({}, { npmPublishRegistry: "" }, context),
    "https://registry.npmjs.org"
  );
  t.is(
    getRegistry({}, { npmRegistryServer: "" }, context),
    "https://registry.npmjs.org"
  );
  t.is(getRegistry({}, {}, context), "https://registry.npmjs.org");
  t.is(
    getRegistry({}, {}, { ...context, env: { YARN_NPM_PUBLISH_REGISTRY: "" } }),
    "https://registry.npmjs.org"
  );
  t.is(
    getRegistry({}, {}, { ...context, env: { YARN_NPM_REGISTRY_SERVER: "" } }),
    "https://registry.npmjs.org"
  );
});

test("Get registry from yarnrc", async (t) => {
  const context = createContext();

  t.is(
    getRegistry(
      {},
      {
        npmPublishRegistry: "https://custom1.registry.com",
      },
      context
    ),
    "https://custom1.registry.com"
  );
  t.is(
    getRegistry(
      {},
      {
        npmRegistryServer: "https://custom1.registry.com",
      },
      context
    ),
    "https://custom1.registry.com"
  );
  t.is(
    getRegistry(
      {},
      {
        npmPublishRegistry: "https://custom1.registry.com",
        npmRegistryServer: "https://custom2.registry.com",
      },
      context
    ),
    "https://custom1.registry.com"
  );
});

test("Get registry from environment variables", async (t) => {
  const context = createContext();

  t.is(
    getRegistry(
      {},
      {},
      {
        ...context,
        env: { YARN_NPM_PUBLISH_REGISTRY: "https://custom1.registry.com" },
      }
    ),
    "https://custom1.registry.com"
  );
  t.is(
    getRegistry(
      {},
      {},
      {
        ...context,
        env: { YARN_NPM_REGISTRY_SERVER: "https://custom1.registry.com" },
      }
    ),
    "https://custom1.registry.com"
  );
  t.is(
    getRegistry(
      {},
      {},
      {
        ...context,
        env: {
          YARN_NPM_PUBLISH_REGISTRY: "https://custom1.registry.com",
          YARN_NPM_REGISTRY_SERVER: "https://custom2.registry.com",
        },
      }
    ),
    "https://custom1.registry.com"
  );
});

test("Get registry from publishConfig", async (t) => {
  const context = createContext();

  t.is(
    getRegistry(
      { publishConfig: { registry: "https://custom1.registry.com" } },
      {},
      context
    ),
    "https://custom1.registry.com"
  );
});

test("Precedence: publishConfig > environment variables > yarnrc", async (t) => {
  const context = createContext();

  t.is(
    getRegistry(
      { publishConfig: { registry: "https://custom1.registry.com" } },
      {
        npmPublishRegistry: "https://custom2.registry.com",
      },
      {
        ...context,
        env: {
          YARN_NPM_PUBLISH_REGISTRY: "https://custom3.registry.com",
        },
      }
    ),
    "https://custom1.registry.com"
  );
  t.is(
    getRegistry(
      {},
      {
        npmPublishRegistry: "https://custom1.registry.com",
      },
      {
        ...context,
        env: {
          YARN_NPM_PUBLISH_REGISTRY: "https://custom2.registry.com",
        },
      }
    ),
    "https://custom2.registry.com"
  );
});
