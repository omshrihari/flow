import { z } from "zod";

export const boardSchema = z.object({
  title: z.string().min(1, "Board title is required").max(50, "Board title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  theme: z.string().min(1, "Theme is required"),
});

export type BoardInput = z.infer<typeof boardSchema>;
