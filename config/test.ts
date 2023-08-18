import YextClient from "./YextClient/index.ts";
import { getChatCompletion } from "./gptUtils.ts";

const YEXT_API_KEY = "9a378056fe8dae3e34cb3002654f8a4d";

// This doesn't work, not totally sure why
Deno.test("Creating a crawler", async () => {
  const yext = new YextClient(YEXT_API_KEY);
  const res = await yext.createCrawler({
    resourceId: "test-crawler-again",
    resource: {
      name: "test-crawler-again",
      domains: ["https://yext.com/"],
      crawlSchedule: "daily",
    },
  });
  console.log(res);
});

Deno.test("Creating a Chat Completion", async () => {
  const res = await getChatCompletion({
    messages: [{ role: "user", content: "Say this is a test!" }],
  });
  console.log(res);
});
