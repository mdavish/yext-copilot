import type { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";

export const listFields: Goal = {
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
};

export default listFields;
