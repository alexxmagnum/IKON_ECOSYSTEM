import { z } from "zod";

/**
 * @motanos/contracts — shared API contracts and Zod schemas.
 * No business workflows yet (bootstrap only).
 */
export const PlatformIdentitySchema = z.object({
  platform: z.literal("MotanOS"),
});

export type PlatformIdentity = z.infer<typeof PlatformIdentitySchema>;
