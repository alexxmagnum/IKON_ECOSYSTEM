import type {
  Context,
  ContextKind,
  ContextStatus,
  CreateContextInput,
} from "./context";
import {
  CONTEXT_PARTICIPANT_REF_KEY,
  CONTEXT_SCOPE_REF_KEY,
  CONTEXT_STATUSES,
  isContextKind,
  isContextStatus,
} from "./context";

let contextSequence = 0;

export interface CreateContextOptions {
  /**
   * When set, context may only be created for this scope
   * (cross-ambit isolation).
   */
  [CONTEXT_SCOPE_REF_KEY]?: string;
}

/**
 * Build a checked Context (in-memory — ambit representation only).
 * Does not create root orgs, participants, proof schemes, or run processes.
 */
export function createContext(
  input: CreateContextInput,
  options: CreateContextOptions = {},
): Context {
  const scopeRaw = input[CONTEXT_SCOPE_REF_KEY];
  const scopeReference =
    typeof scopeRaw === "string" ? scopeRaw.trim() : undefined;
  const participantRaw = input[CONTEXT_PARTICIPANT_REF_KEY];
  const participantReference =
    typeof participantRaw === "string" ? participantRaw.trim() : undefined;
  const organizationReference = input.organizationReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const parentContextReference = input.parentContextReference?.trim();
  const boundScopeRaw = options[CONTEXT_SCOPE_REF_KEY];
  const boundScope =
    typeof boundScopeRaw === "string"
      ? boundScopeRaw.trim() || undefined
      : undefined;

  if (!isContextKind(input.contextKind)) {
    throw new Error(`Unknown context kind: ${String(input.contextKind)}`);
  }

  const contextStatus: ContextStatus =
    input.contextStatus ?? CONTEXT_STATUSES.Draft;
  if (!isContextStatus(contextStatus)) {
    throw new Error(
      `Unknown context status: ${String(input.contextStatus)}`,
    );
  }

  if (scopeRaw !== undefined && !scopeReference) {
    throw new Error(
      `${CONTEXT_SCOPE_REF_KEY} must not be empty when provided`,
    );
  }
  if (participantRaw !== undefined && !participantReference) {
    throw new Error(
      `${CONTEXT_PARTICIPANT_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error("organizationReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (
    input.parentContextReference !== undefined &&
    !parentContextReference
  ) {
    throw new Error(
      "parentContextReference must not be empty when provided",
    );
  }

  if (
    boundScope !== undefined &&
    (scopeReference === undefined || scopeReference !== boundScope)
  ) {
    throw new Error("context does not apply to this scope");
  }

  const providedReference = input.contextReference?.trim() ?? "";
  if (input.contextReference !== undefined && !providedReference) {
    throw new Error("contextReference must not be empty when provided");
  }

  const contextKind: ContextKind = input.contextKind;
  const contextReference =
    providedReference || allocateContextReference();

  return {
    contextReference,
    contextKind,
    contextStatus,
    ...(scopeReference !== undefined && scopeReference.length > 0
      ? { [CONTEXT_SCOPE_REF_KEY]: scopeReference }
      : {}),
    ...(participantReference !== undefined && participantReference.length > 0
      ? { [CONTEXT_PARTICIPANT_REF_KEY]: participantReference }
      : {}),
    ...(organizationReference !== undefined && organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(parentContextReference !== undefined &&
    parentContextReference.length > 0
      ? { parentContextReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateContextReference(): string {
  contextSequence += 1;
  return `context-${contextSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetContextReferenceSequence(): void {
  contextSequence = 0;
}
