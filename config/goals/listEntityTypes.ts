import { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";

export const listEntityTypes: Goal = {
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
};

export default listEntityTypes;
