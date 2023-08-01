import YextClient from "./YextClient/index.ts";
import { type ChatFunction } from "./chatTypes.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

const YEXT_API_KEY = "9a378056fe8dae3e34cb3002654f8a4d";

export const listEntityTypes: ChatFunction = async () => {
  const yextClient = new YextClient(YEXT_API_KEY);
  const res = await yextClient.listEntityTypes();
  return {
    queryResult: res,
  };
};

export const createEntityType: ChatFunction = async ({ notes }) => {
  const yextClient = new YextClient(YEXT_API_KEY);
  const neededSchema = z.object({
    typeId: z.string(),
    displayName: z.string(),
    pluralDisplayName: z.string().optional(),
  });
  const { typeId, displayName } = neededSchema.parse(notes?.collectedData);

  const res = await yextClient.createEntityType({
    typeId: `ce_${typeId}`,
    typeSchema: {
      displayName,
    },
  });

  return {
    queryResult: {
      ...res,
    },
  };
};
