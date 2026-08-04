/**
 * @motanos/session — Session Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/session
 *
 * Session = temporal interaction existence (“what session exists”).
 * Must not depend on proof-scheme packages, actor-existence packages,
 * belonging packages, capacity packages, scope packages, or durable keep-alive.
 *
 * @see DEC-SESSION-BOUNDARY-001
 */

export const SESSION_BOUNDARY = "@motanos/session" as const;

export type {
  CreateSessionInput,
  CreateSessionOptions,
  Session,
  SessionKind,
  SessionPort,
  SessionStatus,
} from "./sessions";
export {
  SESSION_KINDS,
  SESSION_KIND_VALUES,
  SESSION_PROOF_REF_KEY,
  SESSION_SCOPE_REF_KEY,
  SESSION_STATUSES,
  SESSION_STATUS_VALUES,
  SESSION_WHO_REF_KEY,
  createSession,
  isSession,
  isSessionKind,
  isSessionPort,
  isSessionStatus,
  resetSessionReferenceSequence,
} from "./sessions";
