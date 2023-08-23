import { z } from "https://deno.land/x/zod/mod.ts";

export const ListResourceResponseSchema = z.object({
  meta: z.object({
    uuid: z.string(),
    errors: z.array(z.unknown()),
  }),
  response: z.array(z.string()),
});

export type ListResourceResponse = z.infer<typeof ListResourceResponseSchema>;
