import type { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";

export const modifySearchExperience: Goal = {
  goal: "Modify a search experience in the user's account.",
  instructions: [
    {
      type: "function",
      function: async () => {
        const client = new YextClient(YEXT_API_KEY);
        const searchExperiences = await client.listSearchExperiences();
        return {
          queryResult: { searchExperiences },
        };
      },
    },
    {
      type: "select",
      fieldId: "selectedExperienceKey",
      listSelector: "searchExperiences.response",
    },
    {
      type: "reply",
      instruction:
        "Thank the user, but tell them that the rest of this goal isn't set up yet so they'll have to come back later to set up their experience.",
      mode: "CONVERSATIONAL",
    },
  ],
};

export default modifySearchExperience;
