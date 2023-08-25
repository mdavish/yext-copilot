import type { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";

export const listSearchExperiences: Goal = {
  goal: "List the search experiences in the user's account.",
  instructions: [
    {
      type: "function",
      function: async () => {
        const client = new YextClient(YEXT_API_KEY);
        const res = await client.listSearchExperiences();
        return {
          queryResult: res,
        };
      },
    },
    {
      type: "reply",
      mode: "DIRECT_ANSWER",
      instruction:
        "Respond with a list of every single experience from the 'response' portion of the search results. For each search experience, create a deep link to its page using the following format: https://www.yext.com/s/[[context.businessId]]/search/experiences/configuration/<ID_OF_EXPERIENCE>/details",
    },
  ],
};

export default listSearchExperiences;
