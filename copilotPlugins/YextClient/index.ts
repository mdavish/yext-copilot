import { EntityType } from "./inputTypes.ts";
import { ListEntitiesResponse } from "./outputTypes.ts";

export default class YextClient {
  public apiKey: string;
  public v: string;

  constructor(apiKey: string, v: string = "20230801") {
    this.apiKey = apiKey;
    this.v = v;
  }

  public async listEntityTypes() {
    const url =
      "https://api.yextapis.com/v2/accounts/me/config/resourcenames/km/entity-type";

    const params = new URLSearchParams({
      api_key: this.apiKey,
      v: this.v,
    });
    const fullUrl = `${url}?${params.toString()}`;
    const res = await fetch(fullUrl, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to list entity types");
    }

    const json = await res.json();
    return ListEntitiesResponse.parse(json);
  }

  public async createEntityType({
    typeId,
    typeSchema,
  }: {
    typeId: `ce_${string}`;
    typeSchema: Omit<EntityType, "$id" | "$schema">;
  }) {
    const url = new URL(
      "https://api.yextapis.com/v2/accounts/me/config/resources/km/entity-type"
    );
    const params = new URLSearchParams({
      api_key: this.apiKey,
      v: this.v,
    });
    url.search = params.toString();

    const fullBody: EntityType = {
      $id: typeId,
      $schema: "https://schema.yext.com/config/km/entity-type/v2",
      ...typeSchema,
    };
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullBody),
    });
    if (!res.ok) {
      throw new Error("Failed to create entity type");
    }
    return res.json();
  }
}
