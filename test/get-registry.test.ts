import { getRegistry } from "../src/get-registry.js";

test("Get default registry", async () => {
  expect(getRegistry({}, {}, {})).toBe("https://registry.npmjs.org");
  expect(getRegistry({ publishConfig: {} }, {}, {})).toBe(
    "https://registry.npmjs.org"
  );
  expect(getRegistry({}, { npmPublishRegistry: "" }, {})).toBe(
    "https://registry.npmjs.org"
  );
  expect(getRegistry({}, { npmRegistryServer: "" }, {})).toBe(
    "https://registry.npmjs.org"
  );
  expect(getRegistry({}, {}, { env: {} })).toBe("https://registry.npmjs.org");
  expect(getRegistry({}, {}, { env: { YARN_NPM_PUBLISH_REGISTRY: "" } })).toBe(
    "https://registry.npmjs.org"
  );
  expect(getRegistry({}, {}, { env: { YARN_NPM_REGISTRY_SERVER: "" } })).toBe(
    "https://registry.npmjs.org"
  );
});

test("Get registry from yarnrc", async () => {
  expect(
    getRegistry(
      {},
      {
        npmPublishRegistry: "https://custom1.registry.com",
      },
      {}
    )
  ).toBe("https://custom1.registry.com");
  expect(
    getRegistry(
      {},
      {
        npmRegistryServer: "https://custom1.registry.com",
      },
      {}
    )
  ).toBe("https://custom1.registry.com");
  expect(
    getRegistry(
      {},
      {
        npmPublishRegistry: "https://custom1.registry.com",
        npmRegistryServer: "https://custom2.registry.com",
      },
      {}
    )
  ).toBe("https://custom1.registry.com");
});

test("Get registry from environment variables", async () => {
  expect(
    getRegistry(
      {},
      {},
      {
        env: { YARN_NPM_PUBLISH_REGISTRY: "https://custom1.registry.com" },
      }
    )
  ).toBe("https://custom1.registry.com");
  expect(
    getRegistry(
      {},
      {},
      {
        env: { YARN_NPM_REGISTRY_SERVER: "https://custom1.registry.com" },
      }
    )
  ).toBe("https://custom1.registry.com");
  expect(
    getRegistry(
      {},
      {},
      {
        env: {
          YARN_NPM_PUBLISH_REGISTRY: "https://custom1.registry.com",
          YARN_NPM_REGISTRY_SERVER: "https://custom2.registry.com",
        },
      }
    )
  ).toBe("https://custom1.registry.com");
});

test("Get registry from publishConfig", async () => {
  expect(
    getRegistry(
      { publishConfig: { registry: "https://custom1.registry.com" } },
      {},
      {}
    )
  ).toBe("https://custom1.registry.com");
});

test("Precedence: publishConfig > environment variables > yarnrc", async () => {
  expect(
    getRegistry(
      { publishConfig: { registry: "https://custom1.registry.com" } },
      {
        npmPublishRegistry: "https://custom2.registry.com",
      },
      {
        env: {
          YARN_NPM_PUBLISH_REGISTRY: "https://custom3.registry.com",
        },
      }
    )
  ).toBe("https://custom1.registry.com");
  expect(
    getRegistry(
      {},
      {
        npmPublishRegistry: "https://custom1.registry.com",
      },
      {
        env: {
          YARN_NPM_PUBLISH_REGISTRY: "https://custom2.registry.com",
        },
      }
    )
  ).toBe("https://custom2.registry.com");
});
