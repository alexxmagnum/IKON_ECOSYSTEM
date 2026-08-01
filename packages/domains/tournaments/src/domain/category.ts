export type TournamentCategoryId = string;

/**
 * Competitive classification for tournaments.
 * Names are free-form — not a closed enum.
 */
export interface TournamentCategory {
  id: TournamentCategoryId;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
