import type {
  CreateSessionInput,
  Session,
  SessionKind,
  SessionStatus,
} from "./session";
import {
  SESSION_PROOF_REF_KEY,
  SESSION_SCOPE_REF_KEY,
  SESSION_STATUSES,
  SESSION_WHO_REF_KEY,
  isSessionKind,
  isSessionStatus,
} from "./session";

let sessionSequence = 0;

export interface CreateSessionOptions {
  /**
   * When set, session may only be created for this scope
   * (cross-context isolation).
   */
  [SESSION_SCOPE_REF_KEY]?: string;
}

/**
 * Build a checked Session (in-memory — temporal interaction existence only).
 * Does not start/end, renew, or keep durable state.
 */
export function createSession(
  input: CreateSessionInput,
  options: CreateSessionOptions = {},
): Session {
  const whoRaw = input[SESSION_WHO_REF_KEY];
  const whoReference =
    typeof whoRaw === "string" ? whoRaw.trim() : undefined;
  const proofRaw = input[SESSION_PROOF_REF_KEY];
  const proofReference =
    typeof proofRaw === "string" ? proofRaw.trim() : undefined;
  const scopeRaw = input[SESSION_SCOPE_REF_KEY];
  const scopeReference =
    typeof scopeRaw === "string" ? scopeRaw.trim() : undefined;
  const contextReference = input.contextReference?.trim();
  const deviceReference = input.deviceReference?.trim();
  const parentSessionReference = input.parentSessionReference?.trim();
  const boundScopeRaw = options[SESSION_SCOPE_REF_KEY];
  const boundScope =
    typeof boundScopeRaw === "string"
      ? boundScopeRaw.trim() || undefined
      : undefined;

  if (!isSessionKind(input.sessionKind)) {
    throw new Error(`Unknown session kind: ${String(input.sessionKind)}`);
  }

  const sessionStatus: SessionStatus =
    input.sessionStatus ?? SESSION_STATUSES.Draft;
  if (!isSessionStatus(sessionStatus)) {
    throw new Error(
      `Unknown session status: ${String(input.sessionStatus)}`,
    );
  }

  if (whoRaw !== undefined && !whoReference) {
    throw new Error(
      `${SESSION_WHO_REF_KEY} must not be empty when provided`,
    );
  }
  if (proofRaw !== undefined && !proofReference) {
    throw new Error(
      `${SESSION_PROOF_REF_KEY} must not be empty when provided`,
    );
  }
  if (scopeRaw !== undefined && !scopeReference) {
    throw new Error(
      `${SESSION_SCOPE_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.deviceReference !== undefined && !deviceReference) {
    throw new Error("deviceReference must not be empty when provided");
  }
  if (
    input.parentSessionReference !== undefined &&
    !parentSessionReference
  ) {
    throw new Error(
      "parentSessionReference must not be empty when provided",
    );
  }

  if (
    boundScope !== undefined &&
    (scopeReference === undefined || scopeReference !== boundScope)
  ) {
    throw new Error("session does not apply to this scope");
  }

  const providedReference = input.sessionReference?.trim() ?? "";
  if (input.sessionReference !== undefined && !providedReference) {
    throw new Error("sessionReference must not be empty when provided");
  }

  const sessionKind: SessionKind = input.sessionKind;
  const sessionReference =
    providedReference || allocateSessionReference();

  return {
    sessionReference,
    sessionKind,
    sessionStatus,
    ...(whoReference !== undefined && whoReference.length > 0
      ? { [SESSION_WHO_REF_KEY]: whoReference }
      : {}),
    ...(proofReference !== undefined && proofReference.length > 0
      ? { [SESSION_PROOF_REF_KEY]: proofReference }
      : {}),
    ...(scopeReference !== undefined && scopeReference.length > 0
      ? { [SESSION_SCOPE_REF_KEY]: scopeReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(deviceReference !== undefined && deviceReference.length > 0
      ? { deviceReference }
      : {}),
    ...(parentSessionReference !== undefined &&
    parentSessionReference.length > 0
      ? { parentSessionReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateSessionReference(): string {
  sessionSequence += 1;
  return `session-${sessionSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetSessionReferenceSequence(): void {
  sessionSequence = 0;
}
