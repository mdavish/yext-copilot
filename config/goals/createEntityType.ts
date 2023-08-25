import type { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";
import z from "https://deno.land/x/zod@v3.21.4/index.ts";

export const createEntityType: Goal = {
  goal: "Create a new entity type.",
  examples: [
    "Create a new entity type.",
    "Create a new entity type called 'My New Entity Type'.",
  ],
  instructions: [
    {
      type: "collect",
      instruction:
        "Ask the user for display name and ID of the entity type they want to create.",
      fields: [
        {
          id: "typeId",
          optional: false,
          type: "STRING",
        },
        {
          id: "displayName",
          optional: false,
          type: "STRING",
        },
        {
          id: "description",
          optional: false,
          type: "STRING",
        },
        {
          id: "pluralDisplayName",
          optional: true,
          type: "STRING",
        },
      ],
    },
    {
      type: "function",
      function: async ({ notes }) => {
        const yextClient = new YextClient(YEXT_API_KEY);
        const neededSchema = z.object({
          typeId: z.string(),
          displayName: z.string(),
          pluralDisplayName: z.string().optional(),
          description: z.string(),
        });
        const { typeId, displayName, description } = neededSchema.parse(
          notes?.collectedData
        );

        const res = await yextClient.createEntityType({
          resourceId: typeId,
          resource: {
            displayName,
            description,
          },
        });

        return {
          queryResult: {
            ...res,
          },
        };
      },
    },
    {
      type: "reply",
      mode: "CONVERSATIONAL",
      instruction:
        "Tell the user that the entity type was created, and ask them if they want to start adding fields to it.",
    },
  ],
};

export default createEntityType;
