import type {
  Search,
  Collect,
  If,
  RestApi,
  Reply,
  Select,
  ChatBotJSON,
} from "./types.ts";
import { PLUGIN_ID } from "./constants.ts";

interface ChatFunctionPayload {
  messages: Array<{
    text: string;
    timestamp: string;
    source: "USER" | "BOT";
  }>;
  notes?: {
    currentGoal?: string;
    currentStepIndices?: number[];
    searchQuery?: string;
    queryResult: any;
    collectedData?: Record<string, string>;
    goalFirstMsgIndex?: number;
  };
}

export type ChatFunctionReturn = Partial<ChatFunctionPayload["notes"]>;

export type ChatFunction = (
  payload: ChatFunctionPayload
) => Promise<ChatFunctionReturn>;

type Instruction =
  | ({ type: "search" } & Search)
  | ({ type: "reply" } & Reply)
  | ({ type: "collect" } & Collect)
  | ({ type: "if" } & If)
  | ({ type: "restApi" } & RestApi)
  | ({ type: "select" } & Select)
  | { type: "function"; function: ChatFunction };

export type ChatBotConfiguration = {
  $id: string;
  name?: string;
  identityContext?: string;
  initialMessage?: string;
  goals: { [key: string]: Goal };
};

export type Goal = {
  goal: string;
  examples?: string[];
  instructions: Instruction[];
};

export function snakeToCamel(s: string): string {
  return s
    .split(/[^a-zA-Z0-9]/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join("");
}

export function createFunctionName(
  chatbotId: string,
  goalName: string,
  index: number
): string {
  return `${snakeToCamel(chatbotId)}${snakeToCamel(goalName)}${snakeToCamel(
    String(index)
  )}Function`;
}

export const chatbotToJSON = (
  chatbot: ChatBotConfiguration,
  pluginId = PLUGIN_ID
): ChatBotJSON => {
  const json: ChatBotJSON = {
    $schema: "https://schema.yext.com/config/chat/chat-bot/v1",
    $id: chatbot.$id,
    name: chatbot.name,
    identityContext: chatbot.identityContext,
    initialMessage: chatbot.initialMessage,
    goals: {},
  };

  // For each goal, add the goal to the JSON
  for (const [goalName, goal] of Object.entries(chatbot.goals)) {
    json.goals[goalName] = {
      goal: goal.goal,
      examples: goal.examples,
      instructions: [],
    };

    // For each instruction, add the instruction to the JSON
    for (const [index, instruction] of goal.instructions.entries()) {
      if (instruction.type !== "function") {
        json.goals[goalName].instructions.push({
          [instruction.type]: {
            ...instruction,
            // Get rid of the type property
            // (since it's already the key of the object)
            type: undefined,
          },
        });
      } else {
        json.goals[goalName].instructions.push({
          function: {
            pluginId,
            functionName: createFunctionName(chatbot.$id, goalName, index),
          },
        });
      }
    }
  }
  return json;
};
