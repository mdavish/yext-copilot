import type { Goal } from "../ChatBotConfig/index.ts";

export const submitSupportTicket: Goal = {
  goal: "Submit a ticket to Yext's support team.",
  examples: [
    "I need to speak to a person.",
    "I want to submit a ticket.",
    "I need help.",
    "I need to talk to someone.",
  ],
  instructions: [
    {
      type: "collect",
      instruction:
        "Let the user know you're sorry they're having difficulty and that you'll help them get in touch with Yext's support team. Ask them to describe their issue so you can help them get in touch with the right person.",
      fields: [
        {
          id: "description",
          type: "STRING",
          description:
            "A description of the user's issue, including any error messages they're seeing.",
          optional: false,
        },
      ],
    },
    // TODO: Actually send data to Zendesk
    {
      type: "reply",
      mode: "CONVERSATIONAL",
      instruction:
        "Let the user know that you've submitted their ticket and that it's ID is 12345. Say someone from Yext will be in touch with them shortly.",
    },
  ],
};

export default submitSupportTicket;
