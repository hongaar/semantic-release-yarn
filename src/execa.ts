import ogExeca from "execa";

let execImplementation: typeof ogExeca;

setExecaImplementation(ogExeca);

export default function execa(
  file: string,
  args?: readonly string[],
  options?: ogExeca.Options
) {
  return execImplementation(file, args, options);
}

export function setExecaImplementation(implementation: any) {
  execImplementation = implementation;
}
