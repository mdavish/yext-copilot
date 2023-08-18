import { ChatFunction } from "./ChatBotConfig/index.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

// TODO: Obfuscate this key
declare const OPENAI_API_KEY: string;

const MessageSchema = z.object({
  role: z.union([
    z.literal("assistant"),
    z.literal("user"),
    z.literal("system"),
  ]), // This allows only 'assistant' or 'user' as valid roles
  content: z.string(),
});

const ChoiceSchema = z.object({
  message: MessageSchema,
  finish_reason: z.string(),
  index: z.number(),
});

const ResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"), // This ensures the value is strictly 'chat.completion'
  created: z.number(),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
  choices: z.array(ChoiceSchema),
});

type Choice = z.infer<typeof ChoiceSchema>;
type Message = z.infer<typeof MessageSchema>;
type Response = z.infer<typeof ResponseSchema>;

/**
 * Annoyingly have to write our own function because Open AI isn't really supported on Deno.
 */
export const getChatCompletion = async ({
  messages,
}: {
  messages: Message[];
}): Promise<Response> => {
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set.");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    }),
  });
  const json = await response.json();
  console.log(json);
  const parsedResponse = ResponseSchema.parse(json);
  return parsedResponse;
};

/**
 * Mimicks the functionality of predictSearchQuery in Yext Chat.
 * Takes in a list of messages and notes and attempts runs a GPT-3.5 prompt
 * to have the bot predict a good search query to send to the search index.
 */
export const predictSearchQuery: ChatFunction = async ({ messages }) => {
  // const openAI = new OpenAI(api_key);

  const lastMessage = messages[messages.length - 1];
  const systemMessage =
    "You are the Yext Copilot. Your job is to help this user navigate his or her Yext Account. Yext is a SaaS platform that helps users build digital experiences, like websites and chat bots.";
  const prompt = `Your job is to provide a search query based on the last message of the HUMAN.

  Try not to add any additional text or rewrite anything in the last message.
  
  If the last message refers to previous messages, You can use them to help provide context.
  
  If there are no relevant details and the last message is vague, use the last message verbatim, and DO NOT add any other text.
  
  -- EXAMPLES BELOW --
  
  HUMAN: Hey - Do you offer chicken nuggets?
  BOT: Yes, we have chicken nuggets on the menu
  HUMAN: How much are they?
  SEARCH: Chicken Nuggets Price
  ---
  HUMAN: Where are you located?
  SEARCH: Location Address
  ---
  HUMAN: what is abc?
  SEARCH: abc
  
  -- END EXAMPLES --
  
  HUMAN: ${lastMessage.text}
  
  SEARCH:`;

  const result = await getChatCompletion({
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ],
  });

  const searchQuery = result.choices[0].message.content!;

  return {
    collectedData: {
      searchQuery,
    },
  };
};
