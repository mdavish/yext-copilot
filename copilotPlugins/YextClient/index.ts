import { z } from "https://deno.land/x/zod@v3.20.2/index.ts";
import { EntityType } from "./inputTypes.ts";
import type { CacResource } from "./inputTypes.ts";
import { ListEntityTypesResponse, ListFieldsResponse } from "./outputTypes.ts";

export default class YextClient {
  public apiKey: string;
  public v: string;

  constructor(apiKey: string, v: string = "20230801") {
    this.apiKey = apiKey;
    this.v = v;
  }

  private getUrlWithParams(baseUrl: string) {
    const url = new URL(baseUrl);
    const params = new URLSearchParams({
      api_key: this.apiKey,
      v: this.v,
    });
    url.search = params.toString();
    return url;
  }

  public async listConfigResource<
    TParser extends z.ZodType<any, any> | undefined
  >({
    resourceGroup,
    resourceType,
    parser,
  }: {
    resourceGroup: string;
    resourceType: string;
    parser?: TParser;
  }): Promise<
    TParser extends undefined
      ? any
      : TParser extends z.ZodType<any, any>
      ? z.infer<TParser>
      : any
  > {
    const fullUrl = this.getUrlWithParams(
      `https://api.yextapis.com/v2/accounts/me/config/resourcenames/${resourceGroup}/${resourceType}`
    );
    const res = await fetch(fullUrl.toString(), {
      method: "GET",
    });

    if (!res.ok) {
      console.error(res);
      throw new Error(
        `Failed to list config resource ${resourceGroup}/${resourceType}`
      );
    }
    const json = await res.json();
    if (!parser) {
      return json;
    } else {
      return parser.parse(json);
    }
  }

  private listFunctionFactory({
    resourceGroup,
    resourceType,
    parser,
  }: {
    resourceGroup: string;
    resourceType: string;
    parser: z.ZodType<any, any>;
  }) {
    return async () => {
      const result = await this.listConfigResource({
        resourceGroup,
        resourceType,
        parser,
      });
      return result;
    };
  }

  public async createConfigResource<TResource extends CacResource<TResource>>({
    resourceGroup,
    resourceType,
    resource,
  }: {
    resourceGroup: string;
    resourceType: string;
    resourceId: string;
    resource: TResource;
    // TODO: Better output typing
    // Confirm this is what actually gets returned...
  }): Promise<TResource> {
    const fullUrl = this.getUrlWithParams(
      `https://api.yextapis.com/v2/accounts/me/config/resources/${resourceGroup}/${resourceType}`
    );

    const res = await fetch(fullUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resource),
    });

    if (!res.ok) {
      console.error(res);
      throw new Error(`Failed to create entity type: ${res.statusText}`);
    }
    return res.json();
  }

  public listEntityTypes = this.listFunctionFactory({
    resourceGroup: "km",
    resourceType: "entity-type",
    parser: ListEntityTypesResponse,
  });

  private createFunctionFactory<TResource>({
    resourceGroup,
    resourceType,
    schemaURL,
  }: {
    resourceGroup: string;
    resourceType: string;
    schemaURL: string;
  }) {
    return async ({
      resourceId,
      resource,
    }: {
      resourceId: string;
      resource: TResource;
    }) => {
      const result = await this.createConfigResource({
        resourceGroup,
        resourceType,
        resourceId,
        resource: {
          $id: resourceId,
          $schema: schemaURL,
          ...resource,
        },
      });
      return result;
    };
  }

  public listFields = this.listFunctionFactory({
    resourceGroup: "km",
    resourceType: "field",
    parser: ListFieldsResponse,
  });

  public createEntityType = this.createFunctionFactory<EntityType>({
    resourceGroup: "km",
    resourceType: "entity-type",
    schemaURL: "https://schema.yext.com/config/km/entity-type/v2",
  });
}
