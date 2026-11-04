"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { newsSlug, type Locale, type NewsStory } from "@/lib/content";
import { t } from "@/lib/i18n";
import { MaskedText } from "@/components/Motion";

function topic(story: NewsStory) {
  const text = `${story.title} ${story.excerpt}`.toLocaleLowerCase();
  if (/(foundation|sustain|solar|sbti|energie|energy|umwelt|environment)/.test(text)) return "sustainability";
  if (/(reise|visit|besuch|lieferant|producer|partner|farm|produzent)/.test(text)) return "producers";
  return "company";
}

function localizedTopic(story: NewsStory, locale: Locale) {
  const value = topic(story);
  if (value === "sustainability") return t(locale, "sustainability");
  if (value === "company") return t(locale, "company");
  return {
    de: "Produzenten",
    en: "Producers",
    fr: "Producteurs",
    it: "Produttori",
    es: "Productores",
  }[locale];
}

function paginationLabel(locale: Locale, direction: "previous" | "next") {
  const labels = {
    previous: {
      de: "Zurück",
      en: "Previous",
      fr: "Précédent",
      it: "Indietro",
      es: "Anterior",
    },
    next: {
      de: "Weiter",
      en: "Next",
      fr: "Suivant",
      it: "Avanti",
      es: "Siguiente",
    },
  };
  return labels[direction][locale];
}

const pageSize = 12;

function StoryCard({ story, locale }: { story: NewsStory; locale: Locale }) {
  const translation = story.translations?.[locale];
  const title = translation?.title ?? story.title;
  const excerpt =
    translation?.blocks.find((block) => block.type === "p")?.text ??
    story.excerpt;
  const href = `/${locale}/news/${newsSlug(story)}`;

  return (
    <article className="story-card">
      <Link className="story-image" href={href} aria-label={title}>
        {story.image ? (
          <Image
            src={story.image}
            alt={story.imageAlt}
            fill
            sizes="(max-width: 48rem) 100vw, 33vw"
          />
        ) : (
          <span className="image-fallback">{title}</span>
        )}
      </Link>
      <div className="story-body">
        <div className="story-meta">
          <span>{story.date || "PPO News"}</span>
          <span>{localizedTopic(story, locale)}</span>
        </div>
        <Link className="story-title" href={href}>
          <MaskedText as="h3">{title}</MaskedText>
        </Link>
        <MaskedText>{translation ? excerpt : t(locale, "newsOriginalLanguage")}</MaskedText>
        <Link className="text-link" href={href}>{t(locale, "explore")} →</Link>
      </div>
    </article>
  );
}

export function NewsArchive({
  stories,
  locale,
}: {
  stories: NewsStory[];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const availableStories = useMemo(
    () => stories.filter((story) => locale === "de" || story.translations?.[locale]),
    [locale, stories],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(locale);
    return availableStories.filter((story) => {
      const translation = story.translations?.[locale];
      const title = translation?.title ?? story.title;
      const excerpt =
        translation?.blocks.find((block) => block.type === "p")?.text ??
        t(locale, "availableInGerman");
      const matchesQuery =
        !term || `${title} ${excerpt}`.toLocaleLowerCase(locale).includes(term);
      return matchesQuery && (filter === "all" || topic(story) === filter);
    });
  }, [availableStories, filter, locale, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="news-toolbar">
        <label className="catalog-search">
          <span className="visually-hidden">{t(locale, "search")}</span>
          <input
            type="search"
            value={query}
            placeholder={t(locale, "searchPlaceholder")}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="filter-list" aria-label={t(locale, "news")}>
          {[
            ["all", t(locale, "all")],
            ["company", t(locale, "company")],
            ["producers", locale === "de" ? "Produzenten" : locale === "fr" ? "Producteurs" : locale === "it" ? "Produttori" : locale === "es" ? "Productores" : "Producers"],
            ["sustainability", t(locale, "sustainability")],
          ].map(([value, label]) => (
            <button
              className="filter-chip"
              type="button"
              key={value}
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {visible.length ? (
        <div className="story-grid archive-grid">
          {visible.map((story) => (
            <StoryCard story={story} locale={locale} key={story.href} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {availableStories.length ? t(locale, "noSearchResults") : t(locale, "noNewsAvailableInLanguage")}
        </div>
      )}
      {pageCount > 1 && (
        <nav className="pagination" aria-label={t(locale, "news")}>
          <button
            className="button button-secondary"
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            {paginationLabel(locale, "previous")}
          </button>
          <span>{currentPage} / {pageCount}</span>
          <button
            className="button button-secondary"
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            {paginationLabel(locale, "next")}
          </button>
        </nav>
      )}
    </>
  );
}
