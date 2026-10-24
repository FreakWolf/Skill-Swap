import { z } from "zod";

// Shared between creating (/offer) and editing (/offerings/[id]/edit).
export const offeringFieldsSchema = z.object({
  skillName: z.string().min(1, "Choose or enter a skill").max(60),
  title: z.string().min(3, "Give your offering a clear title").max(120),
  description: z.string().max(1000).optional(),
  level: z.enum(["beginner", "intermediate", "expert"]),
  duration: z.coerce.number().int().min(15).max(480),
  cost: z.coerce.number().int().min(0).max(100),
  mode: z.enum(["virtual", "in_person"]),
});

export type OfferingFields = z.infer<typeof offeringFieldsSchema>;
