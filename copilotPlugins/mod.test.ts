import YextClient from "./YextClient/index.ts";

const YEXT_API_KEY = "9a378056fe8dae3e34cb3002654f8a4d";

Deno.test("Listing Entity Types", async () => {
  const yextClient = new YextClient(YEXT_API_KEY);
  const res = await yextClient.listEntityTypes();
  console.log(res);
});

Deno.test("Creating Entity Type", async () => {
  const yextClient = new YextClient(YEXT_API_KEY);
  const res = await yextClient.createEntityType({
    typeId: "ce_testType",
    typeSchema: {
      displayName: "Test Type",
      description: "A test type",
    },
  });
  console.log(res);
});
