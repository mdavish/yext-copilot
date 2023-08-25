import { Goal } from "../ChatBotConfig/index.ts";
import { predictSearchQuery } from "../gptUtils.ts";

export const yextSoftwareQuestion: Goal = {
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
};

export default yextSoftwareQuestion;
