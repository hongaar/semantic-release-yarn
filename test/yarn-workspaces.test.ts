import test from "ava";
import { getWorkspaces } from "../src/yarn-workspaces.js";
import { createContext } from "./helpers/create-context.js";
import { mockExeca } from "./helpers/create-execa-implementation.js";

test.serial("getWorkspaces", async (t) => {
  const context = createContext();

  mockExeca({
    stdout: `{"location":".","name":"@mokr/root"}
{"location":"packages/cli","name":"moker"}
{"location":"packages/core","name":"@mokr/core"}`,
  });

  const workspaces = await getWorkspaces(context);

  t.deepEqual(workspaces, [
    { location: ".", name: "@mokr/root" },
    { location: "packages/cli", name: "moker" },
    { location: "packages/core", name: "@mokr/core" },
  ]);
});
