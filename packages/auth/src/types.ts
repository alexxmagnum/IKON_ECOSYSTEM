/**
 * MotanOS identity types (technical layer).
 * Not coupled to IKON experience.
 */
export type MotanUser = {
  id: string;
  email: string | null;
  appUserId?: string;
};

export type MotanSession = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
  user: MotanUser;
};
