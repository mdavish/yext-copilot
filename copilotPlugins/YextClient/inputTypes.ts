export type Translation = {
  localeCode: string;
  value: string;
};

export type EntityType = {
  $id: `ce_${string}`;
  $schema: "https://schema.yext.com/config/km/entity-type/v2";
  description?: string;
  descriptionTranslation?: Translation[];
  displayName: string;
  displayNameTranslation?: Translation[];
  pluralDisplayName?: string;
  pluralDisplayNameTranslation?: Translation[];
};
