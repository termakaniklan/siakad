import DOMPurify from 'isomorphic-dompurify';

/**
 * HTML sanitization wrapper for any rich-text content rendered to users.
 *
 * Default profile is conservative: no scripts, no event handlers, no embeds. Use the
 * `richText` profile for CMS news/page content where images and tables are expected.
 */
export type SanitizeProfile = 'plain' | 'richText';

function profileConfig(profile: SanitizeProfile) {
  if (profile === 'richText') {
    return {
      ALLOWED_TAGS: [
        'a',
        'b',
        'i',
        'em',
        'strong',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'pre',
        'code',
        'img',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],
      ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'rel', 'target', 'class', 'colspan', 'rowspan'],
      ALLOW_DATA_ATTR: false,
    };
  }
  return {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  };
}

export function sanitizeHtml(input: string, profile: SanitizeProfile = 'plain'): string {
  return DOMPurify.sanitize(input ?? '', profileConfig(profile));
}
