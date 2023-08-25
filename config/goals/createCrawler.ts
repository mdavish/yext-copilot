import type { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";
import z from "https://deno.land/x/zod@v3.21.4/index.ts";
import { zodSchemaToCollectFields } from "../ChatBotConfig/zodUtils.ts";

const CrawlerDataSchema = z.object({
  crawlerId: z.string().optional().describe("The ID of the crawler."),
  crawlerName: z.string().describe("The name of the crawler."),
  domain: z.string().describe("The domain to crawl."),
  crawlSchedule: z
    .enum(["once", "daily", "weekly"])
    .optional()
    .default("daily")
    .describe("The schedule to run the crawler on."),
});

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
      fields: zodSchemaToCollectFields(CrawlerDataSchema),
    },
    {
      type: "function",
      function: async ({ notes }) => {
        const yextClient = new YextClient(YEXT_API_KEY);
        const { crawlerId, crawlerName, domain, crawlSchedule } =
          CrawlerDataSchema.parse(notes?.collectedData);

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
            crawlSchedule: crawlSchedule ?? "daily",
            crawlStrategy: "allPages", // TODO: Make this configurable
            enabled: true,
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
