import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  articleSlug,
  CareerPage,
  ContactPage,
  HomePage,
  NewsDetailPage,
  NewsPage,
  OfficialContentPage,
  ProductPage,
  ProductsPage,
  TeamPage,
} from "@/components/ContentPages";
import { SiteShell } from "@/components/SiteShell";
import {
  canonicalPagePath,
  categoryFromSourcePath,
  isLocale,
  newsSlugAliases,
  pageFromSourcePath,
  pageRouteAliases,
  ppo,
  productBySlug,
  sourcePage,
  type Locale,
} from "@/lib/content";
import { t } from "@/lib/i18n";

type RouteParams = {
  locale: string;
  segments?: string[];
};
type PageProps = {
  params: Promise<RouteParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function queryString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") search.set(key, value);
    else if (Array.isArray(value)) {
      for (const item of value) search.append(key, item);
    }
  }
  return search;
}

function storyFromLocalizedPath(
  locale: Locale,
  path: string,
  search: URLSearchParams,
) {
  return ppo.news.find((story) => {
    const localized = story.localizedPaths?.[locale];
    if (!localized) return false;
    const sourceUrl = new URL(localized, "https://www.ppo.ch");
    if (
      sourceUrl.pathname !== path &&
      sourceUrl.pathname !== `/${locale}${path}`
    ) return false;
    const sourceId = sourceUrl.searchParams.get("tx_news_pi1[news]");
    return !sourceId || sourceId === search.get("tx_news_pi1[news]");
  });
}

function sourceRedirect(
  locale: Locale,
  path: string,
  search: URLSearchParams,
) {
  for (const [source, target] of Object.entries(ppo.sourceRoutes)) {
    const sourceUrl = new URL(source, "https://www.ppo.ch");
    if (
      sourceUrl.pathname !== path &&
      sourceUrl.pathname !== `/${locale}${path}`
    ) continue;
    const sourceId = sourceUrl.searchParams.get("tx_news_pi1[news]");
    if (sourceId && sourceId !== search.get("tx_news_pi1[news]")) continue;
    if (!sourceId && sourceUrl.search && sourceUrl.search !== `?${search.toString()}`) {
      continue;
    }
    const localizedTarget = target.replace(/^\/(?:de|en|fr|it|es)(?=\/|$)/, `/${locale}`);
    return localizedTarget;
  }
}

function safeTitle(locale: Locale, segments: string[]) {
  if (!segments.length) return "PPO Services AG";
  if (segments[0] === "products") return t(locale, "products");
  if (segments[0] === "news") return t(locale, "news");
  if (segments[0] === "team") return t(locale, "team");
  const page = sourcePage(segments.at(-1) ?? "");
  return page?.name ?? "PPO Services AG";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam, segments = [] } = await params;
  if (!isLocale(localeParam)) return {};
  const locale = localeParam;
  const story = segments[0] === "news" && segments[1]
    ? ppo.news.find((item) => newsSlugAliases(item).has(segments[1]))
    : undefined;
  const title = story?.translations?.[locale]?.title ?? story?.title ?? safeTitle(locale, segments);
  return {
    title,
    description:
      "PPO Services AG — fresh fruit and vegetables, backed by trusted producer relationships and Swiss expertise.",
    alternates: {
      canonical: `/${locale}${segments.length ? `/${segments.join("/")}` : ""}`,
    },
  };
}

export default async function LocalizedPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale: localeParam, segments = [] }, rawSearch] = await Promise.all([
    params,
    searchParams,
  ]);
  if (!isLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const path = `/${segments.join("/")}`;
  const search = queryString(rawSearch);
  const legacyTarget = sourceRedirect(locale, path, search);

  if (legacyTarget && legacyTarget !== `/${locale}${path}`) {
    redirect(legacyTarget);
  }
  if (!segments.length) {
    return (
      <SiteShell locale={locale}>
        <HomePage locale={locale} />
      </SiteShell>
    );
  }

  if (segments[0] === "products") {
    if (segments.length === 1) {
      return <SiteShell locale={locale}><ProductsPage locale={locale} /></SiteShell>;
    }
    const category =
      ppo.categories.find((item) => item.id === segments[1]) ??
      categoryFromSourcePath(path) ??
      categoryFromSourcePath(`/${locale}${path}`);
    if (!category) notFound();
    if (segments.length === 2) {
      return <SiteShell locale={locale}><ProductsPage locale={locale} category={category} /></SiteShell>;
    }
    if (segments.length === 3) {
      const product = productBySlug(category, segments[2]);
      if (product) {
        return <SiteShell locale={locale}><ProductPage locale={locale} category={category} product={product} /></SiteShell>;
      }
    }
    notFound();
  }

  if (segments[0] === "news") {
    if (segments.length === 1) {
      return <SiteShell locale={locale}><NewsPage locale={locale} /></SiteShell>;
    }
    if (segments.length === 2) {
      const story =
        ppo.news.find((item) => newsSlugAliases(item).has(segments[1])) ??
        storyFromLocalizedPath(locale, path, search);
      if (story) {
        return <SiteShell locale={locale}><NewsDetailPage locale={locale} story={story} /></SiteShell>;
      }
    }
    const legacyStory = storyFromLocalizedPath(locale, path, search);
    if (legacyStory) {
      redirect(`/${locale}/news/${articleSlug(legacyStory)}`);
    }
    notFound();
  }

  if (segments[0] === "team") {
    if (segments.length === 1) {
      return <SiteShell locale={locale}><TeamPage locale={locale} /></SiteShell>;
    }
    if (segments.length === 2) {
      const group = ppo.peopleGroups.find((item) => item.id === segments[1]);
      if (group) {
        return <SiteShell locale={locale}><TeamPage locale={locale} group={group} /></SiteShell>;
      }
    }
    notFound();
  }

  if (segments.length === 1 && segments[0] === "careers") {
    return <SiteShell locale={locale}><CareerPage locale={locale} /></SiteShell>;
  }
  if (segments.length === 1 && segments[0] === "contact") {
    const initialProduct = typeof rawSearch.product === "string" ? rawSearch.product : "";
    const initialEnquiry =
      rawSearch.enquiry === "specifications" ? "Product specifications request" : "";
    return (
      <SiteShell locale={locale}>
        <ContactPage
          locale={locale}
          initialProduct={initialProduct}
          initialEnquiry={initialEnquiry}
        />
      </SiteShell>
    );
  }

  const targetPagePath = `/${locale}/${segments.join("/")}`;
  const page =
    ppo.pages.find((item) => pageRouteAliases(item).has(segments.join("/"))) ??
    pageFromSourcePath(path) ??
    pageFromSourcePath(`/${locale}${path}`) ??
    ppo.pages.find((item) => item.localizedPaths[locale] === targetPagePath);

  if (page) {
    const canonical = `/${locale}/${canonicalPagePath(page.id)}`;
    if (canonical !== targetPagePath) redirect(canonical);
    return (
      <SiteShell locale={locale}>
        <OfficialContentPage page={page} locale={locale} />
      </SiteShell>
    );
  }

  notFound();
}
