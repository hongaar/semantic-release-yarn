// @ts-ignore
import SemanticReleaseError from "@semantic-release/error";
import * as ERROR_DEFINITIONS from "./definitions/errors.js";

export type ErrorDefinition = Error & {
  code: unknown;
  details: unknown;
  semanticRelease: boolean;
};

export function getError(
  code: keyof typeof ERROR_DEFINITIONS,
  ctx: any = {}
): ErrorDefinition {
  const { message, details } = ERROR_DEFINITIONS[code](ctx);
  return new SemanticReleaseError(message, code, details);
}
