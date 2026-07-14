import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { siteConfig } from "@/lib/site.config";

/**
 * End-of-article "About the author" card. A repeatable per-page E-E-A-T trust
 * signal (Google's raters look for this on every article, not just /about).
 */
export function AuthorBox() {
  return (
    <section className="py-10 border-t border-black/[0.07]" aria-label="About the author">
      <Container width="narrow">
        <div className="flex gap-5 items-start">
          <div className="shrink-0 w-16 h-16 rounded-full border-2 border-primary/20 overflow-hidden relative">
            <Image
              src={siteConfig.author.photo}
              alt={`${siteConfig.author.name}, ${siteConfig.author.role} of ${siteConfig.name}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-muted/60 mb-1">
              Written by
            </p>
            <p className="font-display text-lg font-semibold text-text">
              <Link href={siteConfig.author.url} className="hover:text-primary transition-colors">
                {siteConfig.author.name}
              </Link>
              <span className="text-muted font-normal text-sm">
                {" "}· {siteConfig.author.role}
              </span>
            </p>
            <p className="text-sm text-muted leading-relaxed mt-1.5">
              {siteConfig.author.shortBio}
            </p>
            <p className="mt-3 text-xs text-muted/70 leading-relaxed">
              Reviewed and edited per our{" "}
              <Link href="/editorial-policy" className="underline underline-offset-2 hover:text-primary transition-colors">
                editorial standards
              </Link>
              . {siteConfig.name} is not a licensed financial advisor; this is
              educational information, not personalized advice.
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <Link
                href={siteConfig.author.url}
                className="text-primary font-medium hover:underline underline-offset-4 whitespace-nowrap"
              >
                More from {siteConfig.author.name.split(" ")[0]} →
              </Link>
              {siteConfig.author.sameAs
                .filter((h) => h.includes("linkedin"))
                .map((h) => (
                  <a
                    key={h}
                    href={h}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="text-primary/80 hover:text-primary hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    LinkedIn ↗
                  </a>
                ))}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
