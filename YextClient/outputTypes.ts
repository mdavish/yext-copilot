import { z } from "https://deno.land/x/zod/mod.ts";

export const ListEntityTypesResponse = z.object({
  meta: z.object({
    uuid: z.string(),
    errors: z.array(z.unknown()),
  }),
  response: z.array(z.string()),
});

export const ListFieldsResponse = z.object({
  meta: z.object({
    uuid: z.string(),
    errors: z.array(z.unknown()),
  }),
  response: z.array(z.string()),
});

export type ListEntityTypesResponse = z.infer<typeof ListEntityTypesResponse>;
export type ListFieldsResponse = z.infer<typeof ListFieldsResponse>;
