import rawContent from "@/data/ppo-content.json";
import { t } from "@/lib/i18n";

export const locales = ["de", "en", "fr", "it", "es"] as const;
export type Locale = (typeof locales)[number];

export type ProductOrigin = {
  country: string;
  countryNames?: Partial<Record<Locale, string>>;
  months: number[];
  managers: { name: string; href: string }[];
};

export type PPOProduct = {
  name: string;
  names?: Partial<Record<Locale, string>>;
  images: { src: string; alt: string }[];
  origins: ProductOrigin[];
  sourcePath: string;
};

export type PPOCategory = {
  id: string;
  name: string;
  names: Partial<Record<Locale, string>>;
  sourcePath: string;
  localizedPaths: Partial<Record<Locale, string>>;
  description: string;
  products: PPOProduct[];
  cover: string | null;
  unpublished?: boolean;
  sourcePageImages?: { src: string; alt: string }[];
  documents?: { label: string; href: string; source: string }[];
};

export type SourceBlock = { type: string; text: string };
export type SourcePage = {
  id: string;
  name: string;
  sourcePath: string;
  title: string;
  blocks: SourceBlock[];
  images: { src: string; alt: string }[];
  documents: { label: string; href: string; source: string }[];
  localizedPaths: Partial<Record<Locale, string>>;
  translations?: Partial<Record<Locale, { title: string; blocks: SourceBlock[] }>>;
};

export type Person = {
  name: string;
  role: string;
  phone: string;
  mobile: string;
  email: string;
  image: string | null;
  sourceId: string | null;
  roleTranslations?: Partial<Record<Locale, string>>;
};

export type PeopleGroup = {
  id: string;
  name: string;
  sourcePath: string;
  people: Person[];
  localizedPaths?: Partial<Record<Locale, string>>;
  names?: Partial<Record<Locale, string>>;
};

export type NewsStory = {
  title: string;
  href: string;
  sourcePath: string;
  date: string;
  excerpt: string;
  image: string | null;
  imageAlt: string;
  blocks?: SourceBlock[];
  localizedPaths?: Partial<Record<Locale, string>>;
  translations?: Partial<
    Record<Locale, { title: string; blocks: SourceBlock[] }>
  >;
};

export type PPOContent = {
  source: string;
  fetchedAt: string;
  logo: string;
  categories: PPOCategory[];
  peopleGroups: PeopleGroup[];
  pages: SourcePage[];
  news: NewsStory[];
  sourceRoutes: Record<string, string>;
  map: { lat: number; lng: number; address: string };
  social: { instagram: string; tiktok: string; facebook: string };
};

export const ppo = rawContent as PPOContent;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localizedCategoryName(category: PPOCategory, locale: Locale) {
  return category.names[locale] ?? category.name;
}

export function localizedProductName(product: PPOProduct, locale: Locale) {
  return product.names?.[locale] ?? product.name;
}

export function sourcePage(id: string) {
  return ppo.pages.find((page) => page.id === id);
}

const pageRoutes: Record<string, string> = {
  company: "company",
  history: "company/history",
  cooperation: "cooperation",
  foundation: "foundation",
  quality: "quality",
  sustainability: "sustainability",
  sbti: "sustainability/sbti",
  "climate-engagement": "sustainability/climate-engagement",
  "solar-ppo": "sustainability/solar-ppo",
  "solar-ghsa": "sustainability/solar-ghsa",
  "foundation-projects": "sustainability/foundation-projects",
  "gas-recovery": "sustainability/gas-recovery",
  "sbti-documents": "sustainability/sbti/documents",
  "sbti-report": "sustainability/sbti/report",
  "sbti-links": "sustainability/sbti/links",
  careers: "careers",
  contact: "contact",
  legal: "legal",
  privacy: "privacy",
};

export function canonicalPagePath(id: string) {
  return pageRoutes[id] ?? id;
}

export function pageRouteAliases(page: SourcePage) {
  const aliases = new Set([canonicalPagePath(page.id)]);
  const sourcePaths = new Set([
    page.sourcePath,
    ...Object.values(page.localizedPaths),
  ]);
  for (const sourcePath of sourcePaths) {
    const url = new URL(sourcePath, "https://www.ppo.ch");
    const target =
      ppo.sourceRoutes[`${url.pathname}${url.search}`] ??
      ppo.sourceRoutes[url.pathname];
    if (!target) continue;
    const segments = new URL(target, "https://www.ppo.ch").pathname
      .split("/")
      .filter(Boolean);
    if (locales.includes(segments[0] as Locale)) segments.shift();
    if (segments.length) aliases.add(segments.join("/"));
  }
  return aliases;
}

export function localizedPageCopy(page: SourcePage, locale: Locale) {
  const translation = page.translations?.[locale];
  if (translation) return translation;
  return { title: page.title, blocks: page.blocks };
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function newsSlug(story: NewsStory) {
  const base = slugify(story.title);
  const duplicates = ppo.news.filter((item) => slugify(item.title) === base);
  if (duplicates.length < 2) return base;

  const sourceSlug = story.sourcePath.split("/").filter(Boolean).at(-1);
  if (sourceSlug === base || sourceSlug?.startsWith(`${base}-`)) return sourceSlug;
  return `${base}-${duplicates.indexOf(story) + 1}`;
}

export function newsSlugAliases(story: NewsStory) {
  const aliases = new Set([newsSlug(story)]);
  for (const sourcePath of Object.values(story.localizedPaths ?? {})) {
    if (!sourcePath) continue;
    const url = new URL(sourcePath, "https://www.ppo.ch");
    const sourceSlug = url.pathname.split("/").filter(Boolean).at(-1);
    if (sourceSlug && !url.search && sourceSlug !== "detail") {
      aliases.add(sourceSlug);
    }
    const redirect =
      ppo.sourceRoutes[`${url.pathname}${url.search}`] ??
      ppo.sourceRoutes[url.pathname];
    if (redirect) {
      const targetSlug = new URL(redirect, "https://www.ppo.ch").pathname
        .split("/")
        .filter(Boolean)
        .at(-1);
      if (targetSlug) aliases.add(targetSlug);
    }
  }
  return aliases;
}

export function productBySlug(category: PPOCategory, slug: string) {
  return category.products.find((product) => slugify(product.name) === slug);
}

export function pageFromSourcePath(path: string) {
  return ppo.pages.find(
    (page) =>
      page.sourcePath === path ||
      Object.values(page.localizedPaths).includes(path),
  );
}

export function categoryFromSourcePath(path: string) {
  return ppo.categories.find(
    (category) =>
      category.sourcePath === path ||
      Object.values(category.localizedPaths).includes(path),
  );
}

export function groupFromSourcePath(path: string) {
  return ppo.peopleGroups.find(
    (group) =>
      group.sourcePath === path ||
      Object.values(group.localizedPaths ?? {}).includes(path),
  );
}

export function searchIndex(locale: Locale = "de") {
  const entries = [
    ...ppo.categories.map((category) => ({
      title: localizedCategoryName(category, locale),
      description: `${category.products.length} ${t(locale, "productsCount")}`,
      href: `/${locale}/products/${category.id}`,
      kind: t(locale, "categoryKind"),
    })),
    ...ppo.categories.flatMap((category) =>
      category.products.map((product) => ({
        title: localizedProductName(product, locale),
        description: localizedCategoryName(category, locale),
        href: `/${locale}/products/${category.id}/${slugify(product.name)}`,
        kind: t(locale, "productKind"),
      })),
    ),
    ...ppo.pages
      .filter((page) => locale === "de" || page.translations?.[locale])
      .map((page) => {
      const copy = localizedPageCopy(page, locale);
      return {
        title: copy.title,
        description: copy.blocks[0]?.text ?? "",
        href: `/${locale}/${canonicalPagePath(page.id)}`,
        kind: t(locale, "companyKind"),
      };
    }),
    ...ppo.peopleGroups.flatMap((group) =>
      group.people.map((person) => ({
        title: person.name,
        description:
          person.roleTranslations?.[locale] ?? (locale === "de" ? person.role : ""),
        href: `/${locale}/team/${group.id}#${person.sourceId ?? ""}`,
        kind: t(locale, "teamKind"),
      })),
    ),
    ...ppo.news
      .filter((story) => locale === "de" || story.translations?.[locale])
      .map((story) => ({
        title: story.translations?.[locale]?.title ?? story.title,
        description:
          story.translations?.[locale]?.blocks.find((block) => block.type === "p")?.text ??
          story.excerpt,
        href: `/${locale}/news/${newsSlug(story)}`,
        kind: t(locale, "newsKind"),
      })),
  ];
  return entries;
}
