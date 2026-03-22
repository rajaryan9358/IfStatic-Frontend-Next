const toStringSafe = (value) =>
  typeof value === 'string' ? value : value == null ? '' : String(value);

// Removes document/head-level tags from arbitrary HTML blobs.
// Goal: prevent CMS content (or other HTML snippets) from injecting tags that
// App Router must own (<title>, <meta>, <head>, etc).
export const stripForbiddenHeadTags = (html) => {
  let out = toStringSafe(html);
  if (!out) return '';

  // Normalize to avoid edge cases with null bytes.
  out = out.replace(/\u0000/g, '');

  // Strip doctype if a CMS ever returns full-document HTML.
  out = out.replace(/<!\s*doctype\b[\s\S]*?>/gi, '');

  // 1) Remove full <head>...</head> blocks (case-insensitive, multiline)
  out = out.replace(/<\s*head\b[^>]*>[\s\S]*?<\s*\/\s*head\s*>/gi, '');

  // 2) Remove <title>...</title> blocks (and any odd self-closed <title />)
  out = out.replace(/<\s*title\b[^>]*>[\s\S]*?<\s*\/\s*title\s*>/gi, '');
  out = out.replace(/<\s*title\b[^>]*\/\s*>/gi, '');

  // 3) Remove forbidden void tags.
  // Use [^>]* so we stop at the first '>' even if attrs are multiline.
  out = out.replace(/<\s*(meta|link|base)\b[^>]*\/?>/gi, '');

  // 4) Remove stray opening/closing document tags and any weird closers.
  out = out.replace(/<\s*\/\s*(html|head|body|title|meta|link|base)\s*>/gi, '');
  out = out.replace(/<\s*(html|head|body)\b[^>]*>/gi, '');

  return out;
};
