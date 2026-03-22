import 'server-only';

const toStringSafe = (value) => (typeof value === 'string' ? value : value == null ? '' : String(value));

export const stripComments = (html) => {
  const raw = toStringSafe(html);
  if (!raw) return '';
  return raw.replace(/<!--([\s\S]*?)-->/g, '');
};

const stripForbiddenTags = (html) => {
  const raw = toStringSafe(html);
  if (!raw) return '';

  // Drop any attempt to inject document-level tags.
  return raw
    .replace(/<\s*\/?\s*(html|head|body)\b[^>]*>/gi, '')
    .replace(/<\s*title\b[^>]*>[\s\S]*?<\s*\/\s*title\s*>/gi, '')
    .replace(/<\s*meta\b[^>]*>/gi, '')
    .replace(/<\s*link\b[^>]*>/gi, '')
    .replace(/<\s*base\b[^>]*>/gi, '');
};

export const extractFirstScriptContent = (html) => {
  const cleaned = stripForbiddenTags(stripComments(html));
  if (!cleaned.trim()) return '';

  const match = cleaned.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  if (match && match[1]) return String(match[1]).trim();

  // If user pasted raw JS without wrapper
  if (!cleaned.includes('<') && !cleaned.includes('>')) return cleaned.trim();

  return '';
};

export const extractNoScriptBlock = (html) => {
  const cleaned = stripForbiddenTags(stripComments(html));
  const trimmed = cleaned.trim();
  if (!trimmed) return '';

  const match = trimmed.match(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/i);
  if (match && match[0]) return String(match[0]).trim();

  // If user pasted iframe only, wrap it
  if (trimmed.includes('<iframe')) {
    return `<noscript>${trimmed}</noscript>`;
  }

  return '';
};

export const safeJsonLd = (jsonString) => {
  const raw = toStringSafe(jsonString).trim();
  if (!raw) return '';

  // Accept either raw JSON or a <script> wrapper.
  let candidate = raw;
  if (candidate.toLowerCase().includes('<script')) {
    const match = candidate.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    candidate = match && match[1] ? String(match[1]).trim() : '';
  }

  if (!candidate) return '';

  try {
    const stringified = JSON.stringify(JSON.parse(candidate));
    // Prevent closing-script breakouts.
    return stringified.replace(/<\/script/gi, '<\\/script');
  } catch {
    return '';
  }
};
