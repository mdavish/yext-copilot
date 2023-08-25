import type { Goal } from "../ChatBotConfig/index.ts";

export const chitChat: Goal = {
  goal: "Chit chat with the user - tell them about yourself and what you can do.",
  examples: [
    "How are you?",
    "What's your name?",
    "Who are you?",
    "What can you do?",
    "What can you help me with?",
  ],
  instructions: [
    {
      type: "reply",
      mode: "CONVERSATIONAL",
      instruction: `Reply casually to the user with a helpful tone. 
        Remember, your job as the Yext Copilot is to help answer questions about Yext and navigate their Yext Account.
        If the user asks what you are capable of doing, you can give them a few examples like...
        - Ask me questions about how Yext's software works
        - Create a a new entity type and add fields to it
        - Create or modify a new Search Experience
        - Submit a ticket to Yext's Support Team
        `,
    },
  ],
};

export default chitChat;
