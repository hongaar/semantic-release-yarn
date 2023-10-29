type Modules = {
  execa: typeof import("execa").execa;
  readPackage: typeof import("read-pkg").readPackage;
  AggregateError: typeof import("aggregate-error").default;
};

const modules: Modules = {} as any;

async function getDefaultImplementation<T extends keyof Modules>(
  name: T,
): Promise<Modules[T]> {
  switch (name) {
    case "execa":
      return (await import("execa")).execa as any;

    case "readPackage":
      return (await import("read-pkg")).readPackage as any;

    case "AggregateError":
      return (await import("aggregate-error")).default as any;
  }

  throw new Error("Unknown module");
}

export async function getImplementation<T extends keyof Modules>(name: T) {
  if (!(name in modules)) {
    await resetImplementation(name);
  }

  return modules[name];
}

export function setImplementation(name: keyof Modules, implementation: any) {
  modules[name] = implementation;
}

export async function resetImplementation<T extends keyof Modules>(name: T) {
  modules[name] = await getDefaultImplementation(name);
}
