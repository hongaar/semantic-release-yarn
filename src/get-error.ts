// @ts-ignore
import SemanticReleaseError from "@semantic-release/error";
import * as ERROR_DEFINITIONS from "./definitions/errors.js";

export type ErrorDefinition = Error & {
  code: unknown;
  details: unknown;
  semanticRelease: boolean;
};

export function getError<T extends keyof typeof ERROR_DEFINITIONS>(
  code: T,
  ctx: Parameters<(typeof ERROR_DEFINITIONS)[T]>[0]
): ErrorDefinition {
  const { message, details } = ERROR_DEFINITIONS[code](ctx as any);

  return new SemanticReleaseError(message, code, details);
}
