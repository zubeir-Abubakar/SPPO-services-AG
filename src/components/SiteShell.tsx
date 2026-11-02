import type { ReactNode } from "react";
import { ppo, localizedCategoryName, type Locale } from "@/lib/content";
import { searchIndex } from "@/lib/content";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const categories = ppo.categories.map((category) => ({
    id: category.id,
    name: localizedCategoryName(category, locale),
    image: category.cover,
  }));
  const searchEntries = searchIndex(locale);

  return (
    <div className="site-shell">
      <SiteHeader
        locale={locale}
        categories={categories}
        searchEntries={searchEntries}
      />
      <main id="main-content">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
