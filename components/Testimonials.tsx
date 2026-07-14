import { Container, SectionDivider } from "@/components/ui";
import { siteConfig } from "@/lib/site.config";

/**
 * Reader testimonials. Renders ONLY when siteConfig.testimonials has real
 * entries, never ships an empty/placeholder block, and never fabricated
 * reviews (see the note in site.config.ts). Drop genuine quotes into that array
 * and this section appears automatically on the homepage.
 */
export function Testimonials() {
  const items = siteConfig.testimonials;
  if (!items || items.length === 0) return null;

  return (
    <section className="py-14 sm:py-16" aria-labelledby="testimonials-heading">
      <Container>
        <SectionDivider variant="titled" label="Reader stories" spacing="sm" />
        <h2
          id="testimonials-heading"
          className="font-display text-3xl sm:text-4xl font-bold text-text mt-8 mb-10"
        >
          What readers say
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col h-full rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm"
            >
              <blockquote className="flex-1 text-text/85 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-black/[0.06]">
                <span className="block font-display font-semibold text-text">{t.name}</span>
                <span className="block text-xs font-mono uppercase tracking-wide text-muted/70 mt-0.5">
                  {t.context}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
