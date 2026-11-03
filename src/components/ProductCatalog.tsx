"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  localizedCategoryName,
  localizedProductName,
  slugify,
  type Locale,
  type PPOCategory,
  type PPOProduct,
} from "@/lib/content";
import { months, t } from "@/lib/i18n";

function productManagers(product: PPOProduct) {
  const managers = new Map<string, PPOProduct["origins"][number]["managers"][number]>();
  for (const origin of product.origins) {
    for (const manager of origin.managers) {
      const key = manager.href || manager.name;
      if (!managers.has(key)) managers.set(key, manager);
    }
  }
  return [...managers.values()];
}

function ProductTile({
  product,
  category,
  locale,
}: {
  product: PPOProduct;
  category: PPOCategory;
  locale: Locale;
}) {
  const image = product.images[0];
  const origins = product.origins;
  const managers = productManagers(product);
  const monthList = months(locale);
  const productName = localizedProductName(product, locale);

  return (
    <article className="product-card">
      <Link
        className="product-photo"
        href={`/${locale}/products/${category.id}/${slugify(product.name)}`}
        aria-label={`${productName} — ${t(locale, "details")}`}
      >
        {image ? (
          <Image
            src={image.src}
            alt={productName}
            fill
            sizes="(max-width: 48rem) 50vw, (max-width: 62rem) 48vw, 32vw"
          />
        ) : (
          <span className="image-fallback">{productName}</span>
        )}
      </Link>
      <div className="product-card-content">
        <div className="product-title-row">
          <h2>{productName}</h2>
          <span className="product-category-label">
            {localizedCategoryName(category, locale)}
          </span>
        </div>
        {origins.length > 0 && (
          <>
            <p className="product-origin">
              {t(locale, "originLabel")}:{" "}
              {origins
                .map((origin) => origin.countryNames?.[locale] ?? origin.country)
                .join(", ")}
            </p>
            <div
              className="month-strip"
              aria-label={`${t(locale, "availableMonths")}: ${
                monthList.filter((_, index) =>
                  origins.some((origin) => origin.months.includes(index + 1)),
                ).join(", ")
              }`}
            >
              {monthList.map((month, index) => {
                const available = origins.some((origin) =>
                  origin.months.includes(index + 1),
                );
                return (
                  <span
                    className={`month${available ? " is-available" : ""}`}
                    key={month}
                    title={month}
                  >
                    {month}
                  </span>
                );
              })}
            </div>
          </>
        )}
        {origins.length === 0 && (
          <p className="product-origin">{t(locale, "organicNote")}</p>
        )}
        {managers.length > 0 && (
          <div className="product-meta">
            <span>
              {t(locale, "productManager")}:{" "}
              {managers.map((manager) => manager.name).join(", ")}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductCatalog({
  categories,
  locale,
  selectedCategory,
}: {
  categories: PPOCategory[];
  locale: Locale;
  selectedCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");
  const [month, setMonth] = useState("");
  const allOrigins = useMemo(
    () =>
      Array.from(
        new Set(
          categories.flatMap((category) =>
            category.products.flatMap((product) =>
              product.origins.map((item) => item.country),
            ),
          ),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [categories],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(locale);
    return categories.flatMap((category) =>
      category.products
        .filter((product) => {
          const matchesTerm =
            !term ||
            `${product.name} ${Object.values(product.names ?? {}).join(" ")} ${localizedCategoryName(category, locale)}`
              .toLocaleLowerCase(locale)
              .includes(term);
          const matchesOrigin =
            !origin ||
            product.origins.some((item) => item.country === origin);
          const matchesMonth =
            !month ||
            product.origins.some((item) =>
              item.months.includes(Number(month)),
            );
          const matchesCategory =
            !selectedCategory || category.id === selectedCategory;
          return (
            matchesTerm && matchesOrigin && matchesMonth && matchesCategory
          );
        })
        .map((product) => ({ category, product })),
    );
  }, [categories, locale, month, origin, query, selectedCategory]);

  return (
    <>
      <div className="product-toolbar">
        <div className="catalog-filters">
          <label className="catalog-search">
            <span className="visually-hidden">{t(locale, "search")}</span>
            <input
              type="search"
              value={query}
              placeholder={t(locale, "searchPlaceholder")}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="catalog-select">
            <span className="visually-hidden">{t(locale, "originLabel")}</span>
            <select
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            >
              <option value="">{t(locale, "originLabel")}: {t(locale, "all")}</option>
              {allOrigins.map((country) => (
                <option key={country} value={country}>
                  {categories
                    .flatMap((category) =>
                      category.products.flatMap((product) => product.origins),
                    )
                    .find((item) => item.country === country)?.countryNames?.[locale] ??
                    country}
                </option>
              ))}
            </select>
          </label>
          <label className="catalog-select">
            <span className="visually-hidden">{t(locale, "availableMonths")}</span>
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              <option value="">{t(locale, "availableMonths")}: {t(locale, "all")}</option>
              {months(locale).map((monthName, index) => (
                <option value={index + 1} key={`${monthName}-${index}`}>{monthName}</option>
              ))}
            </select>
          </label>
          <label className="catalog-select">
            <span className="visually-hidden">{t(locale, "categories")}</span>
            <select
              value={selectedCategory ?? ""}
              onChange={(event) => {
                const nextCategory = event.target.value;
                window.location.assign(
                  nextCategory
                    ? `/${locale}/products/${nextCategory}`
                    : `/${locale}/products`,
                );
              }}
            >
              <option value="">{t(locale, "categories")}: {t(locale, "all")}</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {localizedCategoryName(category, locale)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span className="catalog-count">
          {filtered.length} {t(locale, "productsCount")}
        </span>
      </div>
      {filtered.length ? (
        <div className="product-grid">
          {filtered.map(({ category, product }) => (
            <ProductTile
              key={`${category.id}-${product.name}`}
              product={product}
              category={category}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">{t(locale, "noProductsMatch")}</div>
      )}
    </>
  );
}

export function ProductDetail({
  category,
  product,
  locale,
}: {
  category: PPOCategory;
  product: PPOProduct;
  locale: Locale;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const images = product.images;
  const active = images[activeImage];
  const monthNames = months(locale);
  const managers = productManagers(product);
  const productName = localizedProductName(product, locale);

  return (
    <section className="product-detail">
      <div className="detail-gallery">
        <div className="detail-main-image">
          {active ? (
            <Image
              src={active.src}
              alt={productName}
              fill
              priority
              sizes="(max-width: 48rem) 100vw, 55vw"
            />
          ) : (
            <span>{productName}</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="product-gallery" aria-label={`${productName} — ${t(locale, "photos")}`}>
            {images.map((image, index) => (
              <button
                type="button"
                key={image.src}
                aria-label={`${t(locale, "photo")} ${index + 1}: ${productName}`}
                aria-pressed={index === activeImage}
                onClick={() => setActiveImage(index)}
              >
                <Image src={image.src} alt="" width={100} height={100} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="detail-copy">
        <span className="section-kicker">{localizedCategoryName(category, locale)}</span>
        <h1>{productName}</h1>
        <p>{t(locale, "availableMonths")}</p>
        {product.origins.map((item) => (
          <div className="availability-row" key={item.country}>
            <strong>{item.countryNames?.[locale] ?? item.country}</strong>
            <div className="month-strip" aria-label={item.months.map((month) => monthNames[month - 1]).join(", ")}>
              {monthNames.map((name, index) => (
                <span
                  className={`month${item.months.includes(index + 1) ? " is-available" : ""}`}
                  key={name}
                  title={name}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
        {managers.length > 0 && (
          <div className="availability-row">
            <strong>{t(locale, "productManager")}</strong>
            <p>
              {managers.map((manager, index) => (
                <span key={`${manager.name}-${manager.href}`}>
                  {index > 0 ? " / " : ""}
                  <Link href={`/${locale}/team/trade${manager.href?.includes("#") ? manager.href.slice(manager.href.indexOf("#")) : ""}`}>
                    {manager.name}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        )}
        <div className="detail-actions">
          <Link
            className="button button-primary"
            href={`/${locale}/contact?enquiry=specifications&product=${encodeURIComponent(productName)}`}
          >
            {t(locale, "requestSpecifications")}
          </Link>
          <Link className="text-link" href={`/${locale}/products/${category.id}`}>
            ← {localizedCategoryName(category, locale)}
          </Link>
        </div>
      </div>
    </section>
  );
}
