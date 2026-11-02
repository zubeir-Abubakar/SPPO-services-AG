import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/content";
import { t } from "@/lib/i18n";

const footerLinks = [
  ["company", "company"],
  ["quality", "quality"],
  ["sustainability", "sustainability"],
  ["news", "news"],
  ["careers", "careers"],
  ["contact", "contact"],
] as const;

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href={`/${locale}`} aria-label="PPO Services AG">
              <Image
                src="/ppo/_assets/1a1c4462d009da437855101cc7ff64ea/Images/ppo-logo.svg"
                alt="PPO Services AG"
                width={200}
                height={65}
              />
            </Link>
            <p>
              {{
                de: "Früchte- und Gemüsehandel mit Schweizer Wurzeln und internationalen Produzentenbeziehungen.",
                en: "Fresh produce trading with Swiss roots and long-standing international producer relationships.",
                fr: "Commerce de fruits et légumes, ancré en Suisse et porté par des relations durables avec les producteurs.",
                it: "Commercio di frutta e verdura con radici svizzere e relazioni di lunga data con i produttori.",
                es: "Comercio de frutas y hortalizas con raíces suizas y relaciones duraderas con productores internacionales.",
              }[locale]}
            </p>
          </div>
          <nav className="footer-links" aria-label={t(locale, "siteNavigation")}>
            {footerLinks.map(([route, key]) => (
              <Link href={`/${locale}/${route}`} key={route}>
                {t(locale, key)}
              </Link>
            ))}
            <Link href={`/${locale}/legal`}>{t(locale, "legal")}</Link>
            <Link href={`/${locale}/privacy`}>{t(locale, "privacyPolicy")}</Link>
            <a href="https://www.instagram.com/pposervicesag/" target="_blank" rel="noreferrer">
              {t(locale, "instagram")}
            </a>
            <a href="https://www.tiktok.com/@helfergland" target="_blank" rel="noreferrer">
              {t(locale, "tiktok")}
            </a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© PPO Services AG</span>
          <span>
            Herrenmattstrasse 2 · CH-4658 Däniken ·{" "}
            <a href="tel:+41622075454">+41 62 207 54 54</a> ·{" "}
            <a href="mailto:info@ppo.ch">info@ppo.ch</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
