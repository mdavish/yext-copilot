import type { Goal } from "../ChatBotConfig/index.ts";

export const chitChat: Goal = {
  goal: "Chit chat with the user.",
  examples: ["How are you?", "What's your name?", "Who are you?"],
  instructions: [
    {
      type: "reply",
      mode: "CONVERSATIONAL",
      instruction: "Reply casually to the user.",
    },
  ],
};

export default chitChat;
