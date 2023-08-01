import { z } from "https://deno.land/x/zod/mod.ts";

export const ListEntitiesResponse = z.object({
  meta: z.object({
    uuid: z.string(),
    errors: z.array(z.unknown()),
  }),
  response: z.array(z.string()),
});

export type ListEntitiesResponse = z.infer<typeof ListEntitiesResponse>;
