import Image from "next/image";
import Link from "next/link";
import {
  localizedCategoryName,
  localizedPageCopy,
  localizedProductName,
  newsSlug,
  ppo,
  type Locale,
  type NewsStory,
  type PeopleGroup,
  type PPOCategory,
  type PPOProduct,
  type SourcePage,
} from "@/lib/content";
import { t } from "@/lib/i18n";
import { NewsArchive } from "@/components/NewsArchive";
import { ProductCatalog, ProductDetail } from "@/components/ProductCatalog";
import { ContactForm } from "@/components/ContactForm";
import { HomeHero } from "@/components/HomeHero";
import { MaskedText, MilestoneStats } from "@/components/Motion";

function localizedText(locale: Locale, copy: Record<Locale, string>) {
  return copy[locale];
}

function StoryCard({ story, locale }: { story: NewsStory; locale: Locale }) {
  const translation = story.translations?.[locale];
  const title =
    translation?.title ?? t(locale, "contentUnavailableTitle");
  const excerpt =
    translation?.blocks.find((block) => block.type === "p")?.text ??
    t(locale, "availableInGerman");
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
        <div className="story-meta"><span>{story.date || "PPO News"}</span></div>
        <Link className="story-title" href={href}>
          <MaskedText as="h3">{title}</MaskedText>
        </Link>
        <MaskedText>{excerpt}</MaskedText>
        <Link className="text-link" href={href}>{t(locale, "explore")} →</Link>
      </div>
    </article>
  );
}

function PageIntro({
  locale,
  eyebrow,
  title,
  description,
}: {
  locale: Locale;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="page-hero container">
      <div className="page-hero-inner">
        <div>
          {eyebrow && <span className="section-kicker">{eyebrow}</span>}
          <MaskedText as="h1">{title}</MaskedText>
        </div>
        {description && <MaskedText>{description}</MaskedText>}
      </div>
    </header>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
  link,
}: {
  kicker?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="section-heading">
      <div>
        {kicker && <span className="section-kicker">{kicker}</span>}
        <MaskedText as="h2">{title}</MaskedText>
      </div>
      {(description || link) && (
        <div className="section-heading-aside">
          {description && <MaskedText>{description}</MaskedText>}
          {link && <Link className="text-link" href={link.href}>{link.label} →</Link>}
        </div>
      )}
    </div>
  );
}

function CategoryTiles({
  categories,
  locale,
}: {
  categories: PPOCategory[];
  locale: Locale;
}) {
  return (
    <div className="category-grid">
      {categories.map((category) => (
        <Link
          className="category-card"
          href={`/${locale}/products/${category.id}`}
          key={category.id}
        >
          <div className="category-image">
            {category.cover ? (
              <Image
                src={category.cover}
                alt={localizedCategoryName(category, locale)}
                fill
                sizes="(max-width: 48rem) 100vw, (max-width: 62rem) 33vw, 25vw"
              />
            ) : (
              <span className="image-fallback">{localizedCategoryName(category, locale)}</span>
            )}
          </div>
          <div className="category-body">
            <MaskedText as="h3">{localizedCategoryName(category, locale)}</MaskedText>
            <span className="category-arrow" aria-hidden="true">↗</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const categories = ppo.categories;
  const topStory = ppo.news[0];
  const intro = ppo.pages.find((page) => page.id === "company");
  const introCopy = intro ? localizedPageCopy(intro, locale) : null;
  return (
    <>
      <HomeHero
        title={t(locale, "heroTitle")}
        description={t(locale, "heroCopy")}
        primaryAction={t(locale, "discoverProducts")}
        primaryHref={`/${locale}/products`}
        secondaryAction={t(locale, "getInTouch")}
        secondaryHref={`/${locale}/contact`}
      />

      <section className="content-section">
        <div className="container intro-grid">
          <div className="intro-copy">
            <span className="section-kicker">{t(locale, "aboutPPO")}</span>
            <MaskedText as="h2">{t(locale, "introTitle")}</MaskedText>
            {introCopy?.blocks.slice(1, 4).map((block, index) => (
              <MaskedText key={`${index}-${block.text}`}>{block.text}</MaskedText>
            ))}
            <Link className="text-link" href={`/${locale}/company`}>
              {t(locale, "explore")} {t(locale, "company")} →
            </Link>
          </div>
          <Link className="photo-frame intro-photo" href={`/${locale}/company/history`}>
            <Image
              src="/ppo/fileadmin/Files/Pictures/14_Geschichte/1_Geschichte.jpg"
              alt={t(locale, "historyPhotoAlt")}
              fill
              sizes="(max-width: 48rem) 100vw, 42vw"
            />
            <span className="photo-caption">
              Däniken · {t(locale, "switzerland")}
            </span>
          </Link>
        </div>
      </section>

      <section className="content-section portfolio-section">
        <div className="container">
          <SectionHeading
            kicker={t(locale, "products")}
            title={t(locale, "featuredProducts")}
            description={localizedText(locale, {
              de: "Entdecken Sie das PPO-Sortiment – jede Produktaufnahme ist der passenden Kategorie und dem Originalprodukt zugeordnet.",
              en: "Explore PPO's portfolio. Every product photograph is paired with its source product and category.",
              fr: "Découvrez l'assortiment PPO. Chaque photo correspond à son produit et à sa catégorie d'origine.",
              it: "Scoprite l'assortimento PPO. Ogni immagine è associata al prodotto e alla categoria corretti.",
              es: "Descubra el catálogo de PPO. Cada imagen corresponde a su producto y categoría originales.",
            })}
            link={{ href: `/${locale}/products`, label: t(locale, "allCategories") }}
          />
          <CategoryTiles categories={categories} locale={locale} />
        </div>
      </section>

      <section className="content-section network-section">
        <div className="container">
          <div className="split-feature">
            <div className="split-feature-media photo-frame">
              {topStory?.image && (
                <Image
                  src={topStory.image}
                  alt={topStory.translations?.[locale]?.title ?? t(locale, "heroImageAlt")}
                  fill
                  sizes="(max-width: 48rem) 100vw, 54vw"
                />
              )}
            </div>
            <div className="split-feature-content">
              <span className="section-kicker">{t(locale, "producerNetwork")}</span>
              <MaskedText as="h2">{t(locale, "producerHeadline")}</MaskedText>
              <MaskedText>{t(locale, "producerCopy")}</MaskedText>
              <Link className="text-link" href={`/${locale}/cooperation`}>
                {t(locale, "workingTogether")} →
              </Link>
            </div>
          </div>
          <MilestoneStats
            label={localizedText(locale, {
              de: "PPO-Meilensteine",
              en: "PPO milestones",
              fr: "Dates clés de PPO",
              it: "Traguardi di PPO",
              es: "Hitos de PPO",
            })}
            milestones={[
              { value: 1946, label: t(locale, "historyStarted") },
              { value: 1976, label: t(locale, "ppoFounded") },
              { value: 70, suffix: "+", label: t(locale, "yearsExperience") },
            ]}
          />
        </div>
      </section>

      <section className="content-section quality-section">
        <div className="container">
          <SectionHeading
            title={t(locale, "qualityTitle")}
            description={t(locale, "qualityCopy")}
          />
          <div className="category-grid principle-grid">
            {[
              {
                id: "quality",
                title: t(locale, "quality"),
                text: localizedText(locale, {
                  de: "Internationale Standards, Lebensmittelsicherheit und Rückverfolgbarkeit.",
                  en: "International standards, food safety and traceability.",
                  fr: "Normes internationales, sécurité alimentaire et traçabilité.",
                  it: "Standard internazionali, sicurezza alimentare e tracciabilità.",
                  es: "Normas internacionales, seguridad alimentaria y trazabilidad.",
                }),
                href: `/${locale}/quality`,
                image: ppo.pages.find((page) => page.id === "quality")?.images[0],
                color: "leaf",
              },
              {
                id: "sustainability",
                title: t(locale, "sustainability"),
                text: localizedText(locale, {
                  de: "Klimaziele, Umweltprojekte und verantwortungsvolle Lieferketten.",
                  en: "Climate goals, environmental projects and responsible supply chains.",
                  fr: "Objectifs climatiques, projets environnementaux et chaînes d'approvisionnement responsables.",
                  it: "Obiettivi climatici, progetti ambientali e filiere responsabili.",
                  es: "Objetivos climáticos, proyectos ambientales y cadenas de suministro responsables.",
                }),
                href: `/${locale}/sustainability`,
                image: ppo.pages.find((page) => page.id === "sustainability")?.images[0],
                color: "orange",
              },
              {
                id: "foundation",
                title: "PPO Foundation",
                text: localizedText(locale, {
                  de: "Soziales Engagement und Projekte der PPO Gruppe.",
                  en: "PPO Group community and social initiatives.",
                  fr: "Engagement social et projets du groupe PPO.",
                  it: "Impegno sociale e progetti del gruppo PPO.",
                  es: "Compromiso social y proyectos del grupo PPO.",
                }),
                href: `/${locale}/foundation`,
                image: ppo.pages.find((page) => page.id === "foundation")?.images[0],
                color: "berry",
              },
            ].map((item) => (
              <Link className={`principle-card principle-${item.color}`} href={item.href} key={item.id}>
                {item.image && (
                  <div className="principle-image">
                    <Image src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 48rem) 100vw, 30vw" />
                  </div>
                )}
                <div>
                  <MaskedText as="h3">{item.title}</MaskedText>
                  <MaskedText>{item.text}</MaskedText>
                  <span className="text-link">{t(locale, "explore")} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section news-section">
        <div className="container">
          <SectionHeading
            kicker={t(locale, "news")}
            title={t(locale, "latestStories")}
            link={{ href: `/${locale}/news`, label: t(locale, "readArchive") }}
          />
          <div className="story-grid">
            {ppo.news.slice(0, 3).map((story) => (
              <StoryCard key={story.href} story={story} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section closing-section">
        <div className="container">
          <div className="closing-panel">
            <span className="section-kicker">{t(locale, "contact")}</span>
            <MaskedText as="h2">{t(locale, "partnershipTitle")}</MaskedText>
            <MaskedText>{t(locale, "partnershipCopy")}</MaskedText>
            <Link className="button button-primary" href={`/${locale}/contact`}>
              {t(locale, "getInTouch")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProductsPage({
  locale,
  category,
}: {
  locale: Locale;
  category?: PPOCategory;
}) {
  const categories = category ? [category] : ppo.categories;
  const count = categories.reduce((total, item) => total + item.products.length, 0);

  return (
    <>
      <PageIntro
        locale={locale}
        eyebrow={t(locale, "products")}
        title={category ? localizedCategoryName(category, locale) : t(locale, "featuredProducts")}
        description={
          category?.description ||
          localizedText(locale, {
            de: "Frische Früchte und Gemüse aus dem internationalen PPO-Sortiment.",
            en: "Fresh fruit and vegetables from PPO's international portfolio.",
            fr: "Fruits et légumes frais de l'assortiment international de PPO.",
            it: "Frutta e verdura fresca dall'assortimento internazionale di PPO.",
            es: "Frutas y hortalizas frescas del catálogo internacional de PPO.",
          })
        }
      />
      {category?.unpublished && (
        <div className="container content-section compact-section">
          <div className="source-notice">
            <p>{t(locale, "noCatalogueData")}</p>
            <Link className="text-link" href={`/${locale}/contact`}>{t(locale, "getInTouch")} →</Link>
          </div>
        </div>
      )}
      {!category && (
        <section className="container content-section category-index">
          <div className="rail-heading">
            <MaskedText as="h2">{t(locale, "allCategories")}</MaskedText>
            <span className="catalog-count">{categories.length} {t(locale, "categories")}</span>
          </div>
          <CategoryTiles categories={categories} locale={locale} />
        </section>
      )}
      {count > 0 && (
        <section className="container content-section products-listing">
          <div className="rail-heading">
            <MaskedText as="h2">{category ? t(locale, "details") : t(locale, "products")}</MaskedText>
            <span className="catalog-count">{count} {t(locale, "productsCount")}</span>
          </div>
          <ProductCatalog
            categories={ppo.categories}
            locale={locale}
            selectedCategory={category?.id}
          />
        </section>
      )}
      {category?.sourcePageImages?.map((image) => (
        <figure className="container source-image" key={image.src}>
          <Image
            src={image.src}
            alt={image.alt || localizedCategoryName(category, locale)}
            width={800}
            height={600}
          />
        </figure>
      ))}
      {category?.documents?.map((document) => (
        <a
          className="container document-link category-flyer"
          href={document.href}
          key={document.source}
          target="_blank"
          rel="noreferrer"
        >
          <span>{document.label || "Bio Flyer"}</span>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
      {category && (
        <p className="container source-attribution">
          <a href={`https://www.ppo.ch${category.localizedPaths[locale] ?? category.sourcePath}`} target="_blank" rel="noreferrer">
            {t(locale, "officialSource")} ↗
          </a>
        </p>
      )}
    </>
  );
}

export function ProductPage({
  locale,
  category,
  product,
}: {
  locale: Locale;
  category: PPOCategory;
  product: PPOProduct;
}) {
  return (
    <div className="container content-section product-detail-wrap">
      <nav className="breadcrumbs" aria-label={t(locale, "siteNavigation")}>
        <Link href={`/${locale}`}>{t(locale, "home")}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${locale}/products`}>{t(locale, "products")}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${locale}/products/${category.id}`}>{localizedCategoryName(category, locale)}</Link>
      </nav>
      <ProductDetail category={category} product={product} locale={locale} />
      <p className="source-attribution">
        <a href={`https://www.ppo.ch${category.localizedPaths[locale] ?? category.sourcePath}`} target="_blank" rel="noreferrer">
          {t(locale, "officialSource")} ↗
        </a>
      </p>
    </div>
  );
}

export function NewsPage({ locale }: { locale: Locale }) {
  return (
    <>
      <PageIntro
        locale={locale}
        eyebrow={t(locale, "news")}
        title={localizedText(locale, {
          de: "Geschichten aus dem PPO-Netzwerk.",
          en: "Stories from the PPO network.",
          fr: "Les histoires du réseau PPO.",
          it: "Storie dalla rete PPO.",
          es: "Historias de la red PPO.",
        })}
        description={localizedText(locale, {
          de: "Unternehmensnews, Produzentenbesuche und aktuelle Einblicke aus dem Fruchthandel.",
          en: "Company news, producer visits and updates from fresh produce trading.",
          fr: "Actualités de l'entreprise, visites chez les producteurs et nouvelles du commerce des fruits et légumes.",
          it: "Notizie aziendali, visite ai produttori e aggiornamenti sul commercio ortofrutticolo.",
          es: "Noticias de la empresa, visitas a productores y novedades del comercio de frutas y hortalizas.",
        })}
      />
      <section className="container content-section archive-section">
        <NewsArchive stories={ppo.news} locale={locale} />
        <p className="source-attribution">
          <a href="https://www.ppo.ch/news" target="_blank" rel="noreferrer">{t(locale, "officialSource")} · News ↗</a>
        </p>
      </section>
    </>
  );
}

export function NewsDetailPage({
  locale,
  story,
}: {
  locale: Locale;
  story: NewsStory;
}) {
  const translation = story.translations?.[locale];
  const hasTranslation = Boolean(translation) || locale === "de";
  const title = hasTranslation
    ? translation?.title ?? story.title
    : t(locale, "newsOriginalLanguage");
  const blocks = translation?.blocks ?? story.blocks;
  const sourceArticle = story.localizedPaths?.[locale] ?? story.href;

  return (
    <>
      <header className="page-hero container news-detail-head">
        <div className="page-hero-inner">
          <div>
            <span className="section-kicker">{t(locale, "news")}</span>
            <MaskedText as="h1">{title}</MaskedText>
          </div>
          <p>{story.date}</p>
        </div>
      </header>
      <article className="container content-section news-article">
        {story.image && (
          <figure className="news-detail-image">
            <Image src={story.image} alt={story.imageAlt} fill priority sizes="(max-width: 48rem) 100vw, 80vw" />
          </figure>
        )}
        {hasTranslation && blocks?.length ? (
          <div className="content-prose">
            {blocks.map((block, index) => {
              if (block.type === "h1") return null;
              if (block.type === "h2") return <MaskedText as="h2" key={index}>{block.text}</MaskedText>;
              if (block.type === "h3") return <MaskedText as="h3" key={index}>{block.text}</MaskedText>;
              if (block.type === "h4") return <MaskedText as="h4" key={index}>{block.text}</MaskedText>;
              if (block.type === "li") return <MaskedText className="article-list-item" key={index}>{`• ${block.text}`}</MaskedText>;
              return <MaskedText key={index}>{block.text}</MaskedText>;
            })}
          </div>
        ) : !hasTranslation ? (
          <div className="content-prose">
            <MaskedText>{t(locale, "availableInGerman")}</MaskedText>
          </div>
        ) : null}
        <p className="source-attribution">
          <a href={sourceArticle} target="_blank" rel="noreferrer">{t(locale, "sourceArticle")} ↗</a>
        </p>
      </article>
    </>
  );
}

export function ContactPage({
  locale,
  initialProduct = "",
  initialEnquiry = "",
}: {
  locale: Locale;
  initialProduct?: string;
  initialEnquiry?: string;
}) {
  return (
    <>
      <PageIntro
        locale={locale}
        eyebrow={t(locale, "contact")}
        title={t(locale, "contactHeading")}
        description={t(locale, "contactIntro")}
      />
      <section className="container content-section contact-section">
        <ContactForm
          locale={locale}
          initialProduct={initialProduct}
          initialEnquiry={initialEnquiry}
          categories={ppo.categories.map((category) => ({
            id: category.id,
            name: localizedCategoryName(category, locale),
          }))}
        />
      </section>
    </>
  );
}

function PageBlocks({ page, locale }: { page: SourcePage; locale: Locale }) {
  const content = localizedPageCopy(page, locale);
  return (
    <div className="content-prose">
      {content.blocks.map((block, index) => {
        if (block.type === "h1") return null;
        if (block.type === "h2") return <MaskedText as="h2" key={`${index}-${block.text}`}>{block.text}</MaskedText>;
        if (block.type === "h3") return <MaskedText as="h3" key={`${index}-${block.text}`}>{block.text}</MaskedText>;
        if (block.type === "h4") return <MaskedText as="h4" key={`${index}-${block.text}`}>{block.text}</MaskedText>;
        if (block.type === "li") return <MaskedText className="article-list-item" key={`${index}-${block.text}`}>{`• ${block.text}`}</MaskedText>;
        return <MaskedText key={`${index}-${block.text}`}>{block.text}</MaskedText>;
      })}
    </div>
  );
}

function QualityPage({ page, locale }: { page: SourcePage; locale: Locale }) {
  const copy = localizedPageCopy(page, locale);
  const sections: { title: string; blocks: typeof copy.blocks }[] = [];
  let activeSection: (typeof sections)[number] | undefined;
  for (const block of copy.blocks) {
    if (block.type === "h2") {
      activeSection = { title: block.text, blocks: [] };
      sections.push(activeSection);
    } else if (activeSection && block.type !== "h1") {
      activeSection.blocks.push(block);
    }
  }

  const safetySection = sections[0];
  const temperatureSection = sections[3];
  const qualityIntro = copy.blocks.find((block) => block.type === "p")?.text;
  const temperatureCopy = temperatureSection?.blocks.find((block) => block.type === "p")?.text;
  const climateDocument = page.documents[0];
  const certificates = page.images.slice(1);
  const certificateDetails = [
    { match: "IFS_BROCKER", title: "certificateTitleIfsBroker", owner: "ppo" },
    { match: "Fairtrade_PPO", title: "certificateTitleFairtrade", owner: null },
    { match: "AMS_Zertifikat", title: "certificateTitleAms", owner: null },
    { match: "PPO_CoC_Certificate", title: "certificateTitleGlobalGap", owner: "ppo" },
    { match: "BIO_CH-Verordnung", title: "certificateTitleBio", owner: "ppo" },
    { match: "Swiss_GAP", title: "certificateTitleSwissGap", owner: "wfs" },
  ] as const;
  const swissRegulations = [
    {
      label: t(locale, "swissFoodLaw"),
      href: "https://www.fedlex.admin.ch/eli/cc/2017/62/de",
    },
    {
      label: t(locale, "swissResidueRegulation"),
      href: "https://www.fedlex.admin.ch/eli/cc/2017/151/de",
    },
    {
      label: t(locale, "swissOrganicRegulation"),
      href: "https://www.fedlex.admin.ch/eli/cc/1997/2498_2498_2498/de",
    },
  ];

  return (
    <>
      <header className="quality-hero container">
        <div className="quality-hero-copy">
          <span className="section-kicker">{t(locale, "quality")}</span>
          <MaskedText as="h1">{t(locale, "qualityPageTitle")}</MaskedText>
          {qualityIntro && <MaskedText>{qualityIntro}</MaskedText>}
        </div>
        {page.images[0] && (
          <figure className="quality-hero-image">
            <Image
              src={page.images[0].src}
              alt={page.images[0].alt || t(locale, "qualityPageTitle")}
              fill
              priority
              sizes="(max-width: 48rem) 100vw, 48vw"
            />
          </figure>
        )}
      </header>

      <section className="container quality-content">
        {safetySection && (
          <section className="quality-safety">
            <div className="quality-section-heading">
              <span className="section-kicker">{t(locale, "quality")}</span>
              <MaskedText as="h2">{t(locale, "foodSafety")}</MaskedText>
            </div>
            <div className="quality-safety-copy content-prose">
              {safetySection.blocks.map((block, index) => (
                <MaskedText key={`${index}-${block.text}`}>{block.text}</MaskedText>
              ))}
            </div>
          </section>
        )}

        <section className="quality-regulations">
          <div className="quality-section-heading">
            <span className="section-kicker">{t(locale, "qualityContext")}</span>
            <MaskedText as="h2">{sections[1]?.title ?? ""}</MaskedText>
          </div>
          <div className="regulation-grid">
            <article className="regulation-card">
              <MaskedText as="h3">{sections[1]?.title ?? ""}</MaskedText>
              <ul>
                {swissRegulations.map((regulation) => (
                  <li key={regulation.href}>
                    <a href={regulation.href} target="_blank" rel="noreferrer">
                      {regulation.label}<span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
            <article className="regulation-card">
              <MaskedText as="h3">{sections[2]?.title ?? ""}</MaskedText>
              <a
                href="https://food.ec.europa.eu/plants/pesticides/eu-pesticides-database_en"
                target="_blank"
                rel="noreferrer"
              >
                {t(locale, "euPesticideDatabase")}<span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
        </section>

        {temperatureSection && (
          <section className="quality-temperature">
            <div className="quality-section-heading">
              <span className="section-kicker">{t(locale, "quality")}</span>
              <MaskedText as="h2">{temperatureSection.title}</MaskedText>
            </div>
            {temperatureCopy && <MaskedText>{temperatureCopy}</MaskedText>}
            {climateDocument && (
              <a
                className="climate-document-card"
                href={climateDocument.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="document-mark" aria-hidden="true">PDF</span>
                <span className="climate-document-copy">
                  <strong>{climateDocument.label}</strong>
                  <small>{t(locale, "climateGuidelineDescription")}</small>
                </span>
                <span className="document-open" aria-label={t(locale, "documents")}>↗</span>
              </a>
            )}
          </section>
        )}

        <section className="quality-certificates">
          <div className="quality-section-heading">
            <span className="section-kicker">{t(locale, "quality")}</span>
            <MaskedText as="h2">{sections[4]?.title ?? ""}</MaskedText>
            <MaskedText>{t(locale, "certificateUnknownOwner")}</MaskedText>
          </div>
          <div className="certificate-grid">
            {certificates.map((image) => {
              const details = certificateDetails.find((item) =>
                image.src.includes(item.match),
              );
              const ownership =
                details?.owner === "ppo"
                  ? t(locale, "certificateOwnerPpo")
                  : details?.owner === "wfs"
                    ? t(locale, "certificateOwnerWfs")
                    : t(locale, "certificateUnknownOwner");
              const title = t(locale, details?.title ?? "documents");
              return (
                <article className="certificate-card" key={image.src}>
                  <a
                    className="certificate-preview"
                    href={image.src}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t(locale, "certificateOpen")}: ${title}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt || title}
                      fill
                      sizes="(max-width: 38rem) 100vw, (max-width: 62rem) 50vw, 25vw"
                    />
                  </a>
                  <div className="certificate-copy">
                    <MaskedText as="h3">{title}</MaskedText>
                    <MaskedText>{ownership}</MaskedText>
                    <a href={image.src} target="_blank" rel="noreferrer">
                      {t(locale, "certificateOpen")} <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="quality-cta">
          <div>
            <span className="section-kicker">{t(locale, "quality")}</span>
            <MaskedText as="h2">{t(locale, "qualityCtaTitle")}</MaskedText>
            <MaskedText>{t(locale, "qualityCtaCopy")}</MaskedText>
          </div>
          <Link className="button button-primary" href={`/${locale}/contact`}>
            {t(locale, "contact")} <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </section>
    </>
  );
}

export function OfficialContentPage({
  page,
  locale,
}: {
  page: SourcePage;
  locale: Locale;
}) {
  if (page.id === "quality") {
    return <QualityPage page={page} locale={locale} />;
  }

  const hasTranslation = Boolean(page.translations?.[locale]) || locale === "de";
  const copy = hasTranslation
    ? localizedPageCopy(page, locale)
    : { title: t(locale, "contentUnavailableTitle"), blocks: [] };
  const sourcePath = page.localizedPaths[locale] ?? page.sourcePath;
  const editorialImage =
    hasTranslation &&
    page.images.length === 1 &&
    ["company", "history", "sustainability", "cooperation", "careers"].includes(page.id)
      ? page.images[0]
      : undefined;
  return (
    <>
      <PageIntro
        locale={locale}
        eyebrow={page.id === "privacy" || page.id === "legal" ? t(locale, "legal") : t(locale, "company")}
        title={
          hasTranslation
            ? copy.blocks.find((block) => block.type === "h1")?.text ?? copy.title
            : t(locale, "contentUnavailableTitle")
        }
        description={
          hasTranslation && page.id === "company"
            ? t(locale, "companyIntro")
            : undefined
        }
      />
      <section className={`container content-section official-content official-content-${page.id}`}>
        {!hasTranslation && (
          <div className="source-notice">
            <MaskedText>{t(locale, "availableInGerman")}</MaskedText>
            <a className="text-link" href={`https://www.ppo.ch${sourcePath}`} target="_blank" rel="noreferrer">
              {t(locale, "officialSource")} ↗
            </a>
          </div>
        )}
        {editorialImage ? (
          <div className={`editorial-page editorial-page-${page.id}`}>
            <figure className="editorial-page-image">
              <Image
                src={editorialImage.src}
                alt={editorialImage.alt || copy.title}
                fill
                sizes="(max-width: 48rem) 100vw, 45vw"
              />
            </figure>
            <PageBlocks page={page} locale={locale} />
          </div>
        ) : page.images.length > 0 ? (
          <div className={`source-gallery${page.images.length === 1 ? " source-gallery-single" : ""}`}>
            {page.images.map((image) => (
              <figure className="source-image" key={image.src}>
                <Image src={image.src} alt={image.alt || page.name} width={980} height={680} />
              </figure>
            ))}
          </div>
        ) : null}
        {hasTranslation && !editorialImage && <PageBlocks page={page} locale={locale} />}
        {hasTranslation && page.documents.length > 0 && (
          <div className="official-documents">
            <h2>{t(locale, "documents")}</h2>
            <ul className="document-list">
              {page.documents.map((document) => (
                <li key={document.source}>
                  <a className="document-link" href={document.href} target="_blank" rel="noreferrer">
                    <span>{document.label || document.source.split("/").pop()}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {page.id === "company" && hasTranslation && (
          <section className="company-team-entry">
            <div>
              <span className="section-kicker">{t(locale, "team")}</span>
              <MaskedText as="h2">
                {locale === "en" ? "The Team," : t(locale, "teamHeadline")}
              </MaskedText>
              <MaskedText>
                {localizedText(locale, {
                  de: "Lernen Sie die Geschäftsleitung und die Menschen hinter PPO kennen.",
                  en: "Meet PPO's management and the people behind the company.",
                  fr: "Découvrez la direction et les personnes qui font PPO.",
                  it: "Scoprite la direzione e le persone che danno vita a PPO.",
                  es: "Conozca a la dirección y a las personas que forman PPO.",
                })}
              </MaskedText>
            </div>
            <Link className="button button-primary" href={`/${locale}/team/management`}>
              {t(locale, "team")} <span aria-hidden="true">↗</span>
            </Link>
          </section>
        )}

        <p className="source-attribution">
          <a href={`https://www.ppo.ch${sourcePath}`} target="_blank" rel="noreferrer">{t(locale, "officialSource")} ↗</a>
        </p>
      </section>
    </>
  );
}

export function TeamPage({
  locale,
  group,
}: {
  locale: Locale;
  group?: PeopleGroup;
}) {
  const groups = group ? [group] : ppo.peopleGroups;
  const teamTitle = (item: PeopleGroup) =>
    item.id === "management" && locale === "en"
      ? "The Team,"
      : item.names?.[locale] ?? t(locale, "teamHeadline");
  return (
    <>
      <PageIntro
        locale={locale}
        eyebrow={t(locale, "team")}
        title={group ? teamTitle(group) : t(locale, "teamHeadline")}
        description={localizedText(locale, {
          de: "Geschäftsleitung, Handel, Administration, IT, Qualität, Medien und internationale Vertretungen.",
          en: "Management, trade, administration, IT, quality, media and international representatives.",
          fr: "Direction, commercialisation, administration, informatique, qualité, médias et représentations internationales.",
          it: "Direzione, commercializzazione, amministrazione, IT, qualità, media e rappresentanze internazionali.",
          es: "Dirección, comercialización, administración, informática, calidad, medios y representaciones internacionales.",
        })}
      />
      <section className="container content-section">
        <div className="team-groups">
          {groups.map((item) => (
            <section className="team-group" aria-label={teamTitle(item)} key={item.id}>
              {!group && (
                <div className="rail-heading">
                  <MaskedText as="h2">{teamTitle(item)}</MaskedText>
                  <span className="catalog-count">{item.people.length}</span>
                </div>
              )}
              <div className="team-grid">
                {item.people.map((person) => (
                  <article className="person-card" id={person.sourceId ?? undefined} key={`${item.id}-${person.name}`}>
                    {person.image ? (
                      <Image
                        className="person-photo"
                        src={person.image}
                        alt={person.name}
                        width={240}
                        height={300}
                      />
                    ) : (
                      <div className="person-photo image-fallback" aria-hidden="true">
                        {person.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="person-content">
                      <MaskedText as="h3">{person.name}</MaskedText>
                      {(person.roleTranslations?.[locale] ?? person.role) && (
                        <MaskedText className="person-title">
                          {person.roleTranslations?.[locale] ?? person.role}
                        </MaskedText>
                      )}
                      <div className="person-lines">
                        {person.phone && <a href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}>T {person.phone}</a>}
                        {person.mobile && <a href={`tel:${person.mobile.replace(/[^\d+]/g, "")}`}>M {person.mobile}</a>}
                        {person.email && <a href={`mailto:${person.email}`}>{person.email}</a>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="source-attribution">
          <a href={`https://www.ppo.ch${group?.localizedPaths?.[locale] ?? group?.sourcePath ?? "/firma/team/geschaeftsleitung"}`} target="_blank" rel="noreferrer">{t(locale, "officialSource")} ↗</a>
        </p>
      </section>
    </>
  );
}

export function CareerPage({ locale }: { locale: Locale }) {
  const page = ppo.pages.find((item) => item.id === "careers");
  return page ? <OfficialContentPage page={page} locale={locale} /> : (
    <>
      <PageIntro locale={locale} eyebrow={t(locale, "careers")} title={t(locale, "careers")} />
      <section className="container content-section">
        <p>{t(locale, "noRoles")} <a href="mailto:info@ppo.ch">info@ppo.ch</a>.</p>
      </section>
    </>
  );
}

export function TeamBreadcrumb({
  locale,
  category,
  product,
}: {
  locale: Locale;
  category: PPOCategory;
  product: PPOProduct;
}) {
  return (
    <nav className="breadcrumbs" aria-label={t(locale, "siteNavigation")}>
      <Link href={`/${locale}`}>{t(locale, "home")}</Link>
      <span aria-hidden="true">/</span>
      <Link href={`/${locale}/products`}>{t(locale, "products")}</Link>
      <span aria-hidden="true">/</span>
      <Link href={`/${locale}/products/${category.id}`}>{localizedCategoryName(category, locale)}</Link>
      <span aria-hidden="true">/</span>
      <span>{localizedProductName(product, locale)}</span>
    </nav>
  );
}

export function articleSlug(story: NewsStory) {
  return newsSlug(story);
}
