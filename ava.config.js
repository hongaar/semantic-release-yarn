export default {
  files: ["test/*.test.ts"],
  timeout: "1m",
  workerThreads: false,
  extensions: {
    ts: "module",
  },
  nodeArguments: ["--loader=ts-node/esm"],
};
