import type { Metadata } from "next";
import { Container, Tag } from "@/components/ui";
import { siteConfig } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `General disclaimer, affiliate disclosure, and results disclaimer for ${siteConfig.name}.`,
  alternates: { canonical: "/disclaimer" },
  openGraph: { url: "/disclaimer", type: "website" },
  robots: { index: false },
};

export default function DisclaimerPage() {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container width="narrow">
        <div className="mb-12">
          <Tag variant="default" className="mb-5">Legal</Tag>
          <h1 className="font-display text-4xl font-bold text-text mb-3">
            Disclaimer
          </h1>
          <p className="text-sm text-muted">Last updated: {siteConfig.legal.lastUpdated}</p>
        </div>

        <div className="space-y-10 text-text/85 leading-relaxed">

          <section>
            <p className="mb-4 text-sm">
              This page is a general boilerplate starting point, not legal advice.
              Review and adapt it for your own site, and consult a qualified
              professional where appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              General Disclaimer
            </h2>
            <p className="mb-4 text-sm">
              The printables and content published on {siteConfig.name} ({siteConfig.domain})
              are provided for general, personal, non-commercial use. They are intended
              for home décor, organisation, education, and entertainment, and nothing on
              this site constitutes professional, legal, medical, or financial advice.
            </p>
            <p className="mb-4 text-sm">
              Printed results vary by printer, ink, paper, monitor calibration, and
              settings. Colours on screen may not match your printout exactly, and page
              sizing depends on your print dialog. We design and test every file on
              standard US Letter paper, but we cannot guarantee results on every device.
            </p>
            <p className="text-sm">
              Please preview and, where relevant, print a test page before printing in
              bulk. {siteConfig.name} is not responsible for wasted paper, ink, or
              materials.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Affiliate Disclosure
            </h2>
            <p className="mb-4 text-sm">
              {siteConfig.name} participates in affiliate marketing programs. Some links on
              this site are affiliate links, meaning we may earn a small commission if
              you click a link and make a purchase, at no additional cost to you.
            </p>
            <p className="mb-4 text-sm">
              We only recommend products, services, and resources that we genuinely
              believe may be useful to our readers. Affiliate relationships do not
              influence our editorial content, opinions, or recommendations. We aim to
              disclose affiliate relationships transparently throughout the site.
            </p>
            <p className="text-sm">
              This disclosure is made in compliance with the Federal Trade Commission
              (FTC) guidelines on endorsements and testimonials (16 CFR Part 255).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Intellectual Property &amp; Personal-Use License
            </h2>
            <p className="mb-4 text-sm">
              All artwork, designs, and printable files on {siteConfig.name} are original
              and remain the property of {siteConfig.name}. You are welcome to download
              and print them for your own personal, non-commercial use, and to print as
              many copies as you need for your household or classroom.
            </p>
            <p className="mb-4 text-sm">
              You may <span className="font-medium text-text">not</span> resell,
              redistribute, sublicense, or claim the files as your own, share the direct
              PDF links, or use them for any commercial purpose without written
              permission. To feature a printable elsewhere, please link back to the
              original post rather than hosting the file yourself.
            </p>
            <p className="text-sm">
              We design original art only and do not publish characters, brands, or
              franchises. If you believe any content infringes your rights, contact us at{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                {siteConfig.contact.email}
              </a>{" "}
              and we will review it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Advertising
            </h2>
            <p className="text-sm">
              {siteConfig.name} displays third-party advertisements, including those served
              by Google AdSense. The presence of an advertisement on this site does not
              constitute an endorsement of any advertised product, service, or company.
              Advertisers are solely responsible for the accuracy of their ad content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              External Links
            </h2>
            <p className="text-sm">
              This site may contain links to external websites. These links are provided
              for convenience and informational purposes only. {siteConfig.name} does not
              control the content of linked sites and is not responsible for their
              accuracy, completeness, or reliability. Linking to an external site does
              not constitute an endorsement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              No Warranties
            </h2>
            <p className="text-sm">
              All content on {siteConfig.name} is provided &ldquo;as is&rdquo; without
              warranties of any kind. We make reasonable efforts to ensure that
              information is accurate and up to date, but we make no representations
              or warranties regarding completeness, accuracy, reliability, or suitability
              for any particular purpose. Laws, regulations, and best practices
              change over time. Content may become outdated. Always verify information
              through current, authoritative sources before relying on it.
            </p>
          </section>

        </div>
      </Container>
    </main>
  );
}
