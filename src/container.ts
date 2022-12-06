type Modules = {
  execa: typeof import("execa").execa;
  readPackage: typeof import("read-pkg").readPackage;
  AggregateError: typeof import("aggregate-error").default;
};

const initialModules: Modules = {} as any;
let modules: Modules = {} as any;

async function init() {
  if (!initialModules.execa) {
    initialModules.execa = (await import("execa")).execa;
  }
  if (!initialModules.readPackage) {
    initialModules.readPackage = (await import("read-pkg")).readPackage;
  }
  if (!initialModules.AggregateError) {
    initialModules.AggregateError = (await import("aggregate-error")).default;
  }

  modules = initialModules;
}

export async function container() {
  if (Object.entries(modules).length === 0) {
    await init();
  }

  return modules;
}

export function setImplementation(name: keyof Modules, implementation: any) {
  modules[name] = implementation;
}

export function resetImplementation<T extends keyof Modules>(name: T) {
  modules[name] = initialModules[name];
}
