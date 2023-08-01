import { z } from "https://deno.land/x/zod/mod.ts";

const ChatFunctionPayloadSchema = z.object({
  messages: z.array(
    z.object({
      text: z.string(),
      timestamp: z.string(),
      source: z.enum(["USER", "BOT"]),
    })
  ),
  notes: z
    .object({
      currentGoal: z.string().optional(),
      currentStepIndices: z.array(z.number()).optional(),
      searchQuery: z.string().optional(),
      queryResult: z.any(),
      collectedData: z.record(z.string()).optional(),
      goalFirstMsgIndex: z.number().optional(),
    })
    .optional(),
});

export type ChatFunctionPayload = z.infer<typeof ChatFunctionPayloadSchema>;

export type ChatFunctionReturn = Partial<ChatFunctionPayload["notes"]>;

export type ChatFunction = (
  payload: ChatFunctionPayload
) => Promise<ChatFunctionReturn>;