/**
 * @motanos/context — Context Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/context
 *
 * Context = under which ambit something exists.
 * Must not depend on root-org packages, existence-record packages,
 * participant packages, capacity packages, belonging packages,
 * rule-set packages, process-flow packages, or settings engines.
 *
 * @see DEC-CONTEXT-BOUNDARY-001
 */

export const CONTEXT_BOUNDARY = "@motanos/context" as const;

export type {
  CreateContextInput,
  CreateContextOptions,
  Context,
  ContextKind,
  ContextPort,
  ContextStatus,
} from "./contexts";
export {
  CONTEXT_KINDS,
  CONTEXT_KIND_VALUES,
  CONTEXT_PARTICIPANT_REF_KEY,
  CONTEXT_SCOPE_REF_KEY,
  CONTEXT_STATUSES,
  CONTEXT_STATUS_VALUES,
  createContext,
  isContext,
  isContextKind,
  isContextPort,
  isContextStatus,
  resetContextReferenceSequence,
} from "./contexts";
