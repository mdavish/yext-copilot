export type ChatBotJSON = {
  $schema: "https://schema.yext.com/config/chat/chat-bot/v1";
  $id: string;
  name?: string;
  identityContext?: string;
  initialMessage?: string;
  goals: {
    [key: string]: {
      goal: string;
      examples?: string[];
      instructions: Instruction[];
    };
  };
};

export type Instruction = {
  search?: Search;
  reply?: Reply;
  collect?: Collect;
  if?: If;
  restApi?: RestApi;
  function?: Function;
  select?: Select;
};

export type Search = {
  instruction: string;
  experienceKey: string;
  includedVerticals?: string[];
  excludedVerticals?: string[];
  includedFields?: string[];
  excludedFields?: string[];
  locale?: string;
};

export type Reply = {
  instruction: string;
  mode: "VERBATIM" | "CONVERSATIONAL" | "DIRECT_ANSWER";
  citationExample?: string;
  noDataResponse?: string;
  searchUrl?: string;
};

export type Collect = {
  instruction: string;
  fields: Field[];
};

export type Field = {
  id: string;
  type: "NUMBER" | "STRING" | "ENUM" | "BOOLEAN";
  optional?: boolean;
  description?: string;
  possibleValues?: {
    value: string;
    description: string;
  }[];
};

export type If = {
  condition: string;
  instructions: Instruction[];
};

export type RestApi = {
  method: "GET" | "POST";
  url: string;
  params?: { [key: string]: string };
  body?: object;
  jsonFilter?: string;
  additionalHeaders?: { [key: string]: string };
};

export type Function = {
  pluginId: string;
  functionName: string;
  tags?: { [key: string]: string };
};

export type Select = {
  instruction?: string;
  fieldId: string;
  listSelector: string;
};
