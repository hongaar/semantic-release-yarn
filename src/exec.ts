import execa from "execa";

let execImplementation: typeof execa;

restoreExec();

export function exec(...args: Parameters<typeof execa>) {
  return execa(...args);
}

export function mockExec() {}

export function restoreExec() {
  execImplementation = execa;
}
