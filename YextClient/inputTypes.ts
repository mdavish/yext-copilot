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
