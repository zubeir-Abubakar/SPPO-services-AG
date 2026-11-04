import Link from "next/link";
import { MaskedText } from "@/components/Motion";

export function HomeHero({
  title,
  description,
  primaryAction,
  primaryHref,
  secondaryAction,
  secondaryHref,
}: {
  title: string;
  description: string;
  primaryAction: string;
  primaryHref: string;
  secondaryAction: string;
  secondaryHref: string;
}) {
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-topline"><span className="color-mark" /> PPO Services AG · Switzerland</div>
        <MaskedText as="h1">{title}</MaskedText>
        <p>{description}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href={primaryHref}>
            {primaryAction}
          </Link>
          <Link className="button button-secondary" href={secondaryHref}>
            {secondaryAction}
          </Link>
        </div>
      </div>
    </section>
  );
}
