import type { ExecaError, ExecaReturnValue } from "execa";

const DEFAULT_PAYLOAD = {
  command: "mock cmd",
  escapedCommand: "mock cmd",
  exitCode: 0,
  stdout: "a-ok",
  stderr: "",
  failed: false,
  timedOut: false,
  killed: false,
};

const DEFAULT_ERROR = {
  message: "Command failed with ENOENT: unknown command spawn unknown ENOENT",
  errno: -2,
  code: "ENOENT",
  syscall: "spawn unknown",
  path: "unknown",
  spawnargs: ["command"],
  originalMessage: "spawn unknown ENOENT",
  shortMessage:
    "Command failed with ENOENT: unknown command spawn unknown ENOENT",
};

export function createExecaResult(
  payload: Partial<ExecaReturnValue & ExecaError> = {}
) {
  let promise;

  payload = {
    ...DEFAULT_PAYLOAD,
    ...payload,
  };

  if (payload.failed || payload.exitCode !== 0) {
    payload = { ...DEFAULT_ERROR, ...payload };
    const error = new Error(payload.message);
    Object.entries(payload).forEach(([key, value]) => {
      // @ts-ignore
      error[key] = value;
    });
    promise = Promise.reject(error);
  } else {
    promise = Promise.resolve(payload);
  }

  // @ts-ignore
  promise.stdout = { pipe: jest.fn() };

  // @ts-ignore
  promise.stderr = { pipe: jest.fn() };

  return promise;
}

export function mockExeca(
  instance: any,
  payload: Partial<ExecaReturnValue> = {}
) {
  (instance as jest.MockInstance<any, any>).mockImplementation(() =>
    createExecaResult(payload)
  );
}

export function mockExecaError(
  instance: any,
  payload: Partial<ExecaReturnValue & ExecaError> = {}
) {
  (instance as jest.MockInstance<any, any>).mockImplementation(() =>
    createExecaResult({
      ...payload,
      exitCode: 1,
      failed: true,
    })
  );
}

export function restoreExeca(instance: any) {
  (instance as jest.MockInstance<any, any>).mockRestore();
}
