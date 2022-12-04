import execa from "execa";

let execImplementation: typeof execa;

restoreExec();

export function exec(...args: Parameters<typeof execa>) {
  return execImplementation(...args);
}

export function mockExec(returnValue: any) {
  execImplementation = (() => returnValue) as any;
}

export function restoreExec() {
  execImplementation = execa;
}
