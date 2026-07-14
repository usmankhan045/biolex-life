// Long-form intro copy for each audience hub page.
// Keyed by segment.slug from siteConfig.audienceSegments.
// Tone guidance lives in siteConfig, this file just holds the copy.
//
// Empty by default (no audience hubs). When you add entries to
// siteConfig.audienceSegments, add a matching entry here keyed by the segment
// slug, following the SegmentIntro shape below.

export interface SegmentIntro {
  metaDescription: string;
  paragraphs: readonly string[];
  quickLinks: readonly {
    label: string;
    href: string;
    description: string;
  }[];
  emailCtaTitle: string;
  emailCtaDescription: string;
}

export const segmentIntros: Record<string, SegmentIntro> = {};
