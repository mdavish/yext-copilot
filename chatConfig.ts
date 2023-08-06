import { ChatBotConfiguration } from "./ChatBotConfig/index.ts";
import YextClient from "./YextClient/index.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

const YEXT_API_KEY = "9a378056fe8dae3e34cb3002654f8a4d";

const config: ChatBotConfiguration = {
  $id: "yext-copilot",
  name: "Yext Copilot",
  identityContext:
    "Your job is to help this user navigate his or her Yext Account. Yext is a SaaS platform that helps users build digital experiences, like websites and chat bots. Here is a change for testing.",
  initialMessage: "Hello, this is your Yext Copilot. How can I help you?",
  goals: {
    "list-entity-types": {
      goal: "List the entities types in the account.",
      examples: ["What entity types do I have in my account?"],
      instructions: [
        {
          type: "function",
          function: async () => {
            const yextClient = new YextClient(YEXT_API_KEY);
            const res = await yextClient.listEntityTypes();
            return {
              queryResult: res,
            };
          },
        },
        {
          type: "reply",
          mode: "DIRECT_ANSWER",
          instruction: "Tell the user the entity types in their account.",
        },
      ],
    },
    "list-fields": {
      goal: "List the fields in the account.",
      examples: ["What fields do I have in my account?"],
      instructions: [
        {
          type: "function",
          function: async () => {
            const yextClient = new YextClient(YEXT_API_KEY);
            const res = await yextClient.listFields();
            return {
              queryResult: res,
            };
          },
        },
        {
          type: "reply",
          mode: "DIRECT_ANSWER",
          instruction: "Tell the user the fields in their account.",
        },
      ],
    },
    "create-entity-type": {
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
    },
    "create-crawler": {
      examples: [
        "Create a new crawler.",
        "Create a new crawler called 'My New Crawler'.",
      ],
      goal: "Create a new crawler.",
      instructions: [
        {
          type: "collect",
          instruction: "Ask the user for the name of the crawler.",
          fields: [
            {
              id: "crawlerName",
              optional: false,
              type: "STRING",
            },
          ],
        },
      ],
    },
  },
};

export default config;
