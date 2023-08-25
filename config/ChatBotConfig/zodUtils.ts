import type { Field } from "./types.ts";
import z from "https://deno.land/x/zod@v3.21.4/index.ts";
import {
  ZodOptional,
  ZodBoolean,
  ZodEnum,
  ZodNumber,
  ZodString,
  ZodObject,
} from "https://deno.land/x/zod@v3.21.4/types.ts";

type Described<T> = T & {
  describe: (desc: string) => T;
};

type ValidZodTypes =
  | ZodString
  | ZodEnum<[string, ...string[]]>
  | ZodBoolean
  | ZodNumber;

type DescribedValidZodTypes = Described<
  | ValidZodTypes
  | ZodOptional<ValidZodTypes>
  | z.ZodDefault<z.ZodOptional<ValidZodTypes>>
>;

type ValidZodSchema = ZodObject<{
  [key: string]: DescribedValidZodTypes;
}>;

function zodTypeToFieldType(type: DescribedValidZodTypes): Field["type"] {
  if (type instanceof z.ZodDefault) {
    return zodTypeToFieldType(type._def.innerType);
  } else if (type instanceof z.ZodOptional) {
    return zodTypeToFieldType(type._def.innerType);
  } else if (type instanceof z.ZodString) {
    return "STRING";
  } else if (type instanceof z.ZodEnum) {
    return "ENUM";
  } else if (type instanceof z.ZodBoolean) {
    return "BOOLEAN";
  } else if (type instanceof z.ZodNumber) {
    return "NUMBER";
  } else {
    throw new Error(`Unknown Zod type ${type}`);
  }
}

function getEnumValues(type: DescribedValidZodTypes): string[] {
  if (type instanceof z.ZodEnum) {
    return type._def.values;
  } else if (type instanceof z.ZodOptional) {
    return getEnumValues(type._def.innerType);
  } else if (type instanceof z.ZodDefault) {
    return getEnumValues(type._def.innerType);
  } else {
    throw new Error(`Unknown Zod type ${type}`);
  }
}

export function zodSchemaToCollectFields(schema: ValidZodSchema): Field[] {
  const fields: Field[] = [];
  for (const [key, value] of Object.entries(schema.shape)) {
    const type = zodTypeToFieldType(value);
    const field: Field = {
      id: key,
      type,
      description: value.description,
    };
    if (type === "ENUM") {
      const possibleValues = getEnumValues(value);
      field.possibleValues = possibleValues.map((value) => ({
        value,
        // This isn't great, but whatever
        description: value,
      }));
    }
    fields.push(field);
  }
  return fields;
}
