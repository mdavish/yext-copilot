import YextClient from "./YextClient/index.ts";
import z from "https://deno.land/x/zod@v3.21.4/index.ts";
import { zodSchemaToCollectFields } from "./ChatBotConfig/zodUtils.ts";

const YEXT_API_KEY = "9a378056fe8dae3e34cb3002654f8a4d";

Deno.test("Making sure the crazy Zod schema converter works", () => {
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
  const fields = zodSchemaToCollectFields(CrawlerDataSchema);
  console.log({ fields });
});

Deno.test("Adding field type to entity", async () => {
  // This will succeed even if the field already exists
  const yext = new YextClient(YEXT_API_KEY);
  const res = await yext.addFieldToEntityType({
    entityId: "ce_bio",
    fieldId: "c_author",
  });
  console.log(res);
});

Deno.test("Listing search experiences", async () => {
  const yext = new YextClient(YEXT_API_KEY);
  const res = await yext.listSearchExperiences();
  console.log(res);
});

// Works but you need to change the ID
// Deno.test("Creating a crawler", async () => {
//   const yext = new YextClient(YEXT_API_KEY);
//   const res = await yext.createCrawler({
//     resourceId: "test-crawler-again",
//     resource: {
//       name: "test-crawler-again",
//       domains: ["https://yext.com/"],
//       crawlSchedule: "daily",
//       enabled: true,
//       crawlStrategy: "allPages",
//     },
//   });
//   console.log(res);
// });
