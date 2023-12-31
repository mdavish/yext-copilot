import z from "https://deno.land/x/zod@v3.21.4/index.ts";
import { EntityType, Crawler, FieldEligibilityGroup } from "./inputTypes.ts";
import type { CacResource } from "./inputTypes.ts";
import { ListResourceResponseSchema } from "./outputTypes.ts";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

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
      return json as any;
    } else {
      return parser.parse(json) as TParser extends z.ZodType<any, any>
        ? z.infer<TParser>
        : any;
    }
  }

  private listFunctionFactory<TParser extends z.ZodType<any, any>>({
    resourceGroup,
    resourceType,
    parser,
  }: {
    resourceGroup: string;
    resourceType: string;
    parser: TParser;
  }) {
    return async () => {
      const result = await this.listConfigResource({
        resourceGroup,
        resourceType,
        parser,
      });
      return result as z.infer<TParser>;
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
      throw new Error(
        `Failed to create resource: ${resourceGroup}/${resourceType}. Error: ${res.status} - ${res.statusText}`
      );
    }
    return res.json();
  }

  public async patchConfigResource<TResource extends CacResource<TResource>>({
    resourceGroup,
    resourceType,
    resourceId,
    resource,
  }: {
    resourceGroup: string;
    resourceType: string;
    resourceId: string;
    resource: DeepPartial<TResource>;
  }) {
    const fullUrl = this.getUrlWithParams(
      `https://api.yextapis.com/v2/accounts/me/config/resources/${resourceGroup}/${resourceType}/${resourceId}`
    );
    const res = await fetch(fullUrl.toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resource),
    });

    if (!res.ok) {
      console.error(res);
      throw new Error(
        `Failed to patch resource: ${resourceGroup}/${resourceType}/${resourceId}. Error: ${res.status} - ${res.statusText}`
      );
    }
    return res.json();
  }

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

  private patchFunctionFactory<TResource extends CacResource>({
    resourceGroup,
    resourceType,
  }: {
    resourceGroup: string;
    resourceType: string;
  }) {
    return async ({
      resourceId,
      resource,
    }: {
      resourceId: string;
      resource: DeepPartial<TResource>;
    }) => {
      const result = await this.patchConfigResource({
        resourceGroup,
        resourceType,
        resourceId,
        resource,
      });
      return result;
    };
  }

  public listFields = this.listFunctionFactory({
    resourceGroup: "km",
    resourceType: "field",
    parser: ListResourceResponseSchema,
  });

  public listEntityTypes = this.listFunctionFactory({
    resourceGroup: "km",
    resourceType: "entity-type",
    parser: ListResourceResponseSchema,
  });

  public listSearchExperiences = this.listFunctionFactory({
    resourceGroup: "answers",
    resourceType: "answers-config",
    parser: ListResourceResponseSchema,
  });

  public createEntityType = this.createFunctionFactory<EntityType>({
    resourceGroup: "km",
    resourceType: "entity-type",
    schemaURL: "https://schema.yext.com/config/km/entity-type/v2",
  });

  public createCrawler = this.createFunctionFactory<Crawler>({
    schemaURL: "https://schema.yext.com/config/crawler/site-crawler/v1",
    resourceGroup: "crawler",
    resourceType: "site-crawler",
  });

  public patchFieldEligibilityGroup =
    this.patchFunctionFactory<FieldEligibilityGroup>({
      resourceGroup: "km",
      resourceType: "field-eligibility-group",
    });

  /**
   * A more user friendly way to add a field to an entity type.
   * (Because patching a field eligibility group is a bit weird)
   */
  public addFieldToEntityType = async ({
    entityId,
    fieldId,
  }: {
    entityId: string;
    fieldId: string;
  }) => {
    const resourceId = `${entityId}.default`;
    return await this.patchFieldEligibilityGroup({
      resourceId,
      resource: {
        fields: [fieldId],
      },
    });
  };
}
