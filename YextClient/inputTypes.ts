export type CacResource<T = Record<string, any>> = {
  $id: string;
  $schema: string;
};

export type Translation = {
  localeCode: string;
  value: string;
};

export type EntityType = {
  description: string;
  displayName: string;
  descriptionTranslation?: Translation[];
  displayNameTranslation?: Translation[];
  pluralDisplayName?: string;
  pluralDisplayNameTranslation?: Translation[];
};

type Header = {
  key: string;
  value: string;
};

type CrawlSchedule = "once" | "daily" | "weekly";
type CrawlStrategy = "allPages" | "subPages" | "specificPages";
type IgnoreQueryParameterOption = "none" | "all" | "specificParameters";
type FileType = "HTML" | "PDF" | "allTypes";

export interface Crawler {
  $id: string;
  $schema: "https://schema.yext.com/config/crawler/site-crawler/v1";
  name: string;
  enabled?: boolean;
  crawlSchedule?: CrawlSchedule;
  crawlStrategy?: CrawlStrategy;
  domains: string[];
  ignoreQueryParameterOption?: IgnoreQueryParameterOption;
  ignoreQueryParametersList?: string[];
  blacklistedUrls?: string[];
  subPagesUrlStructures?: string[];
  headers?: Header[];
  fileTypes?: FileType[] | "allTypes";
  rateLimit?: number;
  maxDepth?: number;
}
