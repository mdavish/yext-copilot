import type { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";
import z from "https://deno.land/x/zod@v3.21.4/index.ts";

export const createCrawler: Goal = {
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
          fixedCrawlerId = crawlerName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        }

        console.log("I'm about to create a crawler with the following things");
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
};

export default createCrawler;
