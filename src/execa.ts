import { execa as ogExeca, Options } from "execa";

let execImplementation: typeof ogExeca;

setExecaImplementation(ogExeca);

export function execa(
  file: string,
  args?: readonly string[],
  options?: Options
) {
  return execImplementation(file, args, options);
}

export function setExecaImplementation(implementation: any) {
  execImplementation = implementation;
}
