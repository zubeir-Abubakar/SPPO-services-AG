"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/content";

type NavCategory = { id: string; name: string; image: string | null };
type SearchEntry = { title: string; description: string; href: string; kind: string };

const languageOptions: { locale: Locale; flag: string; label: string }[] = [
  { locale: "fr", flag: "🇫🇷", label: "Français" },
  { locale: "de", flag: "🇩🇪", label: "Deutsch" },
  { locale: "en", flag: "🇬🇧", label: "English" },
  { locale: "it", flag: "🇮🇹", label: "Italiano" },
  { locale: "es", flag: "🇪🇸", label: "Español" },
];

export function SiteHeader({
  locale,
  categories,
  searchEntries,
}: {
  locale: Locale;
  categories: NavCategory[];
  searchEntries: SearchEntry[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const productPopoverRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(locale);
    if (!term) return searchEntries.slice(0, 7);
    return searchEntries
      .filter((entry) =>
        `${entry.title} ${entry.description} ${entry.kind}`
          .toLocaleLowerCase(locale)
          .includes(term),
      )
      .slice(0, 12);
  }, [locale, query, searchEntries]);

  useEffect(() => {
    if (!searchOpen && !mobileOpen && !languageOpen && !productsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setLanguageOpen(false);
        setProductsOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [languageOpen, mobileOpen, productsOpen, searchOpen]);

  useEffect(() => {
    if (!productsOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !productPopoverRef.current?.contains(event.target)
      ) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [productsOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const focus = window.setTimeout(
      () => document.getElementById("site-search-input")?.focus(),
      0,
    );
    return () => window.clearTimeout(focus);
  }, [searchOpen]);

  function changeLanguage(nextLocale: Locale) {
    const pathnameParts = (pathname || `/${locale}`).split("/");
    pathnameParts[1] = nextLocale;
    router.push(pathnameParts.join("/") || `/${nextLocale}`);
    setLanguageOpen(false);
    setMobileOpen(false);
  }

  function closeMenus() {
    setMobileOpen(false);
    setProductsOpen(false);
    setLanguageOpen(false);
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container">
          <div className="nav-glass">
            <Link
              className="brand"
              href={`/${locale}`}
              aria-label="PPO Services AG"
              onClick={closeMenus}
            >
              <Image
                src="/ppo/_assets/1a1c4462d009da437855101cc7ff64ea/Images/ppo-logo.svg"
                alt="PPO Services AG"
                width={200}
                height={65}
                priority
              />
            </Link>

            <nav
              id="primary-navigation"
              className="nav-links"
              aria-label={t(locale, "siteNavigation")}
              data-open={mobileOpen}
            >
              <div className="nav-popover product-popover" ref={productPopoverRef}>
                <button
                  className="nav-link nav-products-toggle"
                  type="button"
                  aria-expanded={productsOpen}
                  aria-controls="product-mega-menu"
                  onClick={() => setProductsOpen((open) => !open)}
                >
                  {t(locale, "products")}
                  <span className="products-chevron" aria-hidden="true">⌄</span>
                </button>
                <div
                  className="mega-menu"
                  id="product-mega-menu"
                  hidden={!productsOpen}
                >
                  <div className="mega-menu-heading">
                    <span className="section-kicker">{t(locale, "products")}</span>
                    <Link
                      className="mega-menu-all"
                      href={`/${locale}/products`}
                      onClick={closeMenus}
                    >
                      {t(locale, "viewAllProducts")} <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                  <div className="mega-menu-grid">
                    {categories.map((category) => (
                      <Link
                        className="mega-menu-link"
                        href={`/${locale}/products/${category.id}`}
                        key={category.id}
                        onClick={closeMenus}
                      >
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt=""
                            width={64}
                            height={64}
                          />
                        ) : (
                          <span className="category-placeholder" aria-hidden="true">
                            {category.name.slice(0, 1)}
                          </span>
                        )}
                        <strong>{category.name}</strong>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link className="nav-link" href={`/${locale}/company`} onClick={closeMenus}>
                {t(locale, "company")}
              </Link>
              <Link className="nav-link" href={`/${locale}/quality`} onClick={closeMenus}>
                {t(locale, "quality")}
              </Link>
              <Link
                className="nav-link"
                href={`/${locale}/sustainability`}
                onClick={closeMenus}
              >
                {t(locale, "sustainability")}
              </Link>
              <Link className="nav-link" href={`/${locale}/news`} onClick={closeMenus}>
                {t(locale, "news")}
              </Link>
              <Link className="nav-link" href={`/${locale}/careers`} onClick={closeMenus}>
                {t(locale, "careers")}
              </Link>
              <Link className="nav-link" href={`/${locale}/contact`} onClick={closeMenus}>
                {t(locale, "contact")}
              </Link>
            </nav>

            <div className="nav-actions">
              <div className="nav-popover">
                <button
                  className="nav-action nav-locale"
                  type="button"
                  aria-expanded={languageOpen}
                  aria-controls="language-menu"
                  onClick={() => setLanguageOpen((open) => !open)}
                >
                  {languageOptions.find((option) => option.locale === locale)?.flag}{" "}
                  {locale.toUpperCase()} <span aria-hidden="true">⌄</span>
                </button>
                <div
                  className="language-menu"
                  id="language-menu"
                  hidden={!languageOpen}
                >
                  {languageOptions.map((option) => (
                    <button
                      className="language-option"
                      type="button"
                      key={option.locale}
                      aria-current={option.locale === locale}
                      onClick={() => changeLanguage(option.locale)}
                    >
                      <span aria-hidden="true">{option.flag}</span>
                      <span>
                        {option.locale.toUpperCase()} — {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="nav-action search-trigger"
                type="button"
                aria-label={t(locale, "openSearch")}
                onClick={() => {
                  setSearchOpen(true);
                  closeMenus();
                }}
              >
                <span aria-hidden="true">⌕</span>
                <span className="search-word">{t(locale, "search")}</span>
              </button>
              <Link
                className="button button-primary nav-contact"
                href={`/${locale}/contact`}
                onClick={closeMenus}
              >
                {t(locale, "getInTouch")}
              </Link>
              <button
                className="menu-toggle"
                type="button"
                aria-label={mobileOpen ? t(locale, "closeMenu") : t(locale, "openMenu")}
                aria-expanded={mobileOpen}
                aria-controls="primary-navigation"
                onClick={() => setMobileOpen((open) => !open)}
              >
                <span aria-hidden="true">{mobileOpen ? "×" : "☰"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          className="search-dialog"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <section
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-title"
          >
            <h2 className="visually-hidden" id="search-title">
              {t(locale, "search")}
            </h2>
            <div className="search-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                autoComplete="off"
                id="site-search-input"
                type="search"
                value={query}
                placeholder={t(locale, "searchPlaceholder")}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                className="icon-button"
                type="button"
                aria-label={t(locale, "closeSearch")}
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
              >
                ×
              </button>
            </div>
            <div className="search-results" role="listbox" aria-label={t(locale, "searchResults")}>
              {results.length ? (
                results.map((entry) => (
                  <Link
                    className="search-result"
                    href={entry.href.replace(/^\/de(?=\/|$)/, `/${locale}`)}
                    key={`${entry.kind}-${entry.href}`}
                    role="option"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                  >
                    <strong>{entry.title}</strong>
                    <small>
                      {entry.kind}
                      {entry.description ? ` · ${entry.description}` : ""}
                    </small>
                  </Link>
                ))
              ) : (
                <p className="search-empty">{t(locale, "noSearchResults")}</p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
