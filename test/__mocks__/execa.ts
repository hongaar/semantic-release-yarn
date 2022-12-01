module.exports = jest.fn(() =>
  Promise.resolve({
    stdout: "a-ok",
    stderr: "",
    exitCode: 0,
    cmd: "mock cmd",
    failed: false,
    killed: false,
    signal: null,
  })
);
