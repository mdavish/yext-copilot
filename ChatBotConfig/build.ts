/**
 * This script builds the actual config-as-code resources that
 * are used by the Yext platform. It looks for a "chatConfig.ts"
 * file and will break if it doesn't exist.
 *
 * This process converts the pure Typescript Chat Configuration into
 * a JSON file for the chat configuration plus a set of Typescript
 * plugins that config can reference.
 *
 * Once these files are built, you can run `yext resources apply`
 * and the resources will be created in your account.
 */
import { chatbotToJSON, createFunctionName } from "./index.ts";
import { BUILD_DIR, PLUGINS_DIR, PLUGIN_ID } from "./constants.ts";
import chatbotConfig from "../chatConfig.ts";

const relativeBuildDir = `./${BUILD_DIR}`;

// If the build directory doesn't exist, create it
try {
  if (!(await Deno.stat(relativeBuildDir)).isDirectory) {
    await Deno.mkdir(relativeBuildDir);
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    await Deno.mkdir(relativeBuildDir);
  } else {
    throw error;
  }
}

// If the build directory isn't empty, delete everything in it
for await (const entry of Deno.readDir(relativeBuildDir)) {
  await Deno.remove(`${relativeBuildDir}/${entry.name}`, { recursive: true });
}

// Make the plugins directory
await Deno.mkdir(`${relativeBuildDir}/${PLUGINS_DIR}`);

// Now, we need ALL of the Typescript files that exist at the root
// or any directory therein. EXCEPT for the build directory.
// So we will recursively go through each file - check if it's Typescript -
// And if so, copy it to the build directory.
const directoriesToIgnore = [
  BUILD_DIR,
  ".git",
  ".github",
  ".vscode",
  "node_modules",
  "dist",
];

async function copyFileOrDirectory(
  entry: Deno.DirEntry,
  currentPath: string[] = []
) {
  const name = entry.name;
  const isDirectory = entry.isDirectory;

  if (name.endsWith(".ts") && !isDirectory) {
    const fromPath = [...currentPath, name].join("/");
    const toPath = [BUILD_DIR, PLUGINS_DIR, ...currentPath, name].join("/");
    await Deno.copyFile(fromPath, toPath);
  } else if (isDirectory && !directoriesToIgnore.includes(name)) {
    const newDirPath = [BUILD_DIR, PLUGINS_DIR, ...currentPath, name].join("/");
    try {
      if (!(await Deno.stat(newDirPath)).isDirectory) {
        await Deno.mkdir(newDirPath, { recursive: true });
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        await Deno.mkdir(newDirPath, { recursive: true });
      } else {
        throw error;
      }
    }

    for await (const newEntry of Deno.readDir(
      [...currentPath, name].join("/")
    )) {
      await copyFileOrDirectory(newEntry, [...currentPath, name]);
    }
  }
}

for await (const entry of Deno.readDir("./")) {
  await copyFileOrDirectory(entry, []);
}

// Save the JSON version as well
const json = chatbotToJSON(chatbotConfig);
await Deno.writeTextFile(`./build/chat-config.json`, JSON.stringify(json));

const resourceJson = {
  $id: PLUGIN_ID,
  $schema: "https://schema.yext.com/config/platform/plugin/v1",
};

// Save this as the _resource.json file
await Deno.writeTextFile(
  `${relativeBuildDir}/${PLUGINS_DIR}/_resource.json`,
  JSON.stringify(resourceJson)
);

// Create the strings that must be used to grab the function from the ChatConfig object.
const functionImportStrings: string[] = [];
for (const [goalId, goal] of Object.entries(json.goals)) {
  for (const [instructionIdx, instruction] of goal.instructions.entries()) {
    if (instruction.function) {
      const functionName = createFunctionName(json.$id, goalId, instructionIdx);
      const stepName = functionName.replace("Function", "Step");
      functionImportStrings.push(
        `export const ${stepName} = chatConfig.goals["${goalId}"].instructions[${instructionIdx}];
if (${stepName}.type !== "function") {
    throw new Error("Expected a function");
}
export const ${functionName} = ${stepName}.function;
`
      );
    }
  }
}
// Finally, we create the plugin file, which imports the functions from the
// copied chatConfig.ts file and exports them as a plugin

const pluginFile = `// This file is generated by the build script. Do not edit directly.
import chatConfig from "./chatConfig.ts";
${functionImportStrings.join("\n")}
`;

await Deno.writeTextFile(`./${BUILD_DIR}/${PLUGINS_DIR}/mod.ts`, pluginFile);
