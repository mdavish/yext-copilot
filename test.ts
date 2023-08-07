import YextClient from "./YextClient/index.ts";

const YEXT_API_KEY = "9a378056fe8dae3e34cb3002654f8a4d";

// This doesn't work, not totally sure why
Deno.test("Creating a crawler", async () => {
  const yext = new YextClient(YEXT_API_KEY);
  const res = await yext.createCrawler({
    resourceId: "test-crawler",
    resource: {
      name: "test-crawler",
      domains: ["https://yext.com/"],
      crawlSchedule: "daily",
      crawlStrategy: "allPages",
      enabled: true,
      rateLimit: 15000,
      maxDepth: 10,
    },
  });
  console.log(res);
});
