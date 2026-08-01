/**
 * @motanos/auth — identity contracts and helpers (scaffold).
 * No functional authentication in Phase 1.
 */
export type AuthSubject = {
  userId: string;
};

export const AUTH_PACKAGE = "@motanos/auth" as const;
