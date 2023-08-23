import { ChatBotConfiguration } from "./ChatBotConfig/index.ts";
import YextClient from "./YextClient/index.ts";
import { z } from "https://deno.land/x/zod/mod.ts";
import { predictSearchQuery } from "./gptUtils.ts";

const YEXT_API_KEY = "9a378056fe8dae3e34cb3002654f8a4d";

const config: ChatBotConfiguration = {
  $id: "yext-copilot",
  name: "Yext Copilot",
  identityContext:
    "You are the Yext Copilot. Your job is to help this user navigate his or her Yext Account. Yext is a SaaS platform that helps users build digital experiences, like websites and chat bots.",
  initialMessage: "Hello, this is your Yext Copilot. How can I help you?",
  goals: {
    "create-search-experience": {
      goal: "Create a new search experience in the user's account.",
      examples: [
        "Create a new search experience.",
        "Make me a new search experience",
      ],
      instructions: [
        {
          type: "collect",
          instruction:
            "Say something like 'okay great, what's the name of the search experience you want to create?'",
          fields: [
            {
              type: "STRING",
              id: "searchExperienceId",
              description: "The ID of the search experience.",
              optional: false,
            },
          ],
        },
        {
          type: "function",
          function: async () => {
            const client = new YextClient(YEXT_API_KEY);
            const entityTypes = await client.listEntityTypes();
            return {
              queryResult: { entityTypes },
            };
          },
        },
        // TODO: Add this once SELECT is supported in the JSON.
        // {
        //   instruction:
        //     "Ask the user which entity types from their account they'd like to use.",
        //   type: "select",
        //   fieldId: "selectedEntityIds",
        //   listSelector: "response",
        // },
        {
          type: "reply",
          mode: "CONVERSATIONAL",
          instruction:
            "Let the user know that the rest of this goal isn't set up yet so they will have to come back later.",
        },
      ],
    },
    "yext-software-question": {
      goal: "Answer a question about Yext's software by looking at our documentation.",
      examples: [
        "How does the search algorithm work?",
        "How do I install the Yext CLI?",
        "What is the character limit for single line text fields?",
      ],
      instructions: [
        {
          type: "function",
          function: predictSearchQuery,
        },
        {
          type: "restApi",
          method: "GET",
          url: "https://prod-cdn.us.yextapis.com/v2/accounts/me/search/query?input=[[collectedData.searchQuery]]&experienceKey=yext-help-hitchhikers&api_key=01db1d1e5ebbaa7ea2e6807ad2196ab3&v=20220511&version=PRODUCTION&locale=en",
        },
        {
          type: "reply",
          mode: "DIRECT_ANSWER",
          instruction: "Reply with the answer to the user's question.",
        },
      ],
    },
    "chit-chat": {
      goal: "Chit chat with the user.",
      examples: ["How are you?", "What's your name?", "Who are you?"],
      instructions: [
        {
          type: "reply",
          mode: "CONVERSATIONAL",
          instruction: "Reply casually to the user.",
        },
      ],
    },
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
              id: "crawlerId",
              optional: true,
              type: "STRING",
            },
            {
              id: "crawlerName",
              optional: false,
              type: "STRING",
            },
            {
              id: "domain",
              optional: false,
              type: "STRING",
            },
            {
              id: "crawlSchedule",
              type: "ENUM",
              optional: true,
              possibleValues: [
                {
                  value: "once",
                  description: "Run once",
                },
                {
                  value: "daily",
                  description: "Run daily",
                },
                {
                  value: "weekly",
                  description: "Run weekly",
                },
              ],
            },
          ],
        },
        {
          type: "function",
          function: async ({ notes }) => {
            const yextClient = new YextClient(YEXT_API_KEY);
            const neededSchema = z.object({
              crawlerId: z.string().optional(),
              crawlerName: z.string(),
              domain: z.string(),
              crawlSchedule: z
                .enum(["once", "daily", "weekly"])
                .optional()
                .default("daily"),
            });
            const { crawlerId, crawlerName, domain, crawlSchedule } =
              neededSchema.parse(notes?.collectedData);

            let fixedCrawlerId = crawlerId;
            if (!fixedCrawlerId) {
              fixedCrawlerId = crawlerName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-");
            }

            console.log(
              "I'm about to create a crawler with the following things"
            );
            console.log({
              resourceId: fixedCrawlerId,
              resource: {
                name: crawlerName,
                domains: [domain],
                crawlSchedule: crawlSchedule,
              },
            });

            const res = await yextClient.createCrawler({
              resourceId: fixedCrawlerId,
              resource: {
                name: crawlerName,
                domains: [domain],
                crawlSchedule: crawlSchedule,
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
          instruction: "Tell the user that the crawler was created.",
          mode: "CONVERSATIONAL",
        },
      ],
    },
  },
};

export default config;
