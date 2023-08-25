import type { Goal } from "../ChatBotConfig/index.ts";
import YextClient from "../YextClient/index.ts";
import { YEXT_API_KEY } from "../ChatBotConfig/constants.ts";

export const createSearchExperience: Goal = {
  goal: "Create a new search experience in the user's account.",
  examples: [
    "Create a new search experience.",
    "Make me a new search experience",
  ],
  instructions: [
    {
      type: "collect",
      instruction:
        "Say something like 'okay great, what's the name of the search experience you want to create?'",
      fields: [
        {
          type: "STRING",
          id: "searchExperienceId",
          description: "The ID of the search experience.",
          optional: false,
        },
      ],
    },
    {
      type: "function",
      function: async () => {
        const client = new YextClient(YEXT_API_KEY);
        const entityTypes = await client.listEntityTypes();
        return {
          queryResult: { entityTypes },
        };
      },
    },
    {
      type: "select",
      fieldId: "selectedEntityIds",
      listSelector: "entityTypes.response",
    },
    {
      type: "reply",
      mode: "CONVERSATIONAL",
      instruction:
        "Let the user know that the rest of this goal isn't set up yet so they will have to come back later.",
    },
  ],
};

export default createSearchExperience;
