import 'server-only';

import { cache } from 'react';

const DEFAULT_BASE_URL = 'http://127.0.0.1:5003';

const getBaseUrl = () => {
  const raw =
    process.env.PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_BASE_URL;

  return String(raw).replace(/\/+$/, '');
};

const toStringSafe = (value) => (typeof value === 'string' ? value : value == null ? '' : String(value));

const getSeoMetaCached = cache(async (page_type, sub_type) => {

  if (!page_type) {
    return {
      meta_title: '',
      meta_description: '',
      meta_schema: '',
      head_tag_manager: '',
      body_tag_manager: ''
    };
  }

  const url = new URL(getBaseUrl() + '/api/public/meta');
  url.searchParams.set('page_type', page_type);
  if (sub_type) url.searchParams.set('sub_type', sub_type);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      return {
        meta_title: '',
        meta_description: '',
        meta_schema: '',
        head_tag_manager: '',
        body_tag_manager: ''
      };
    }

    const json = await res.json();
    const data = json?.data || {};

    return {
      meta_title: toStringSafe(data.meta_title).trim(),
      meta_description: toStringSafe(data.meta_description).trim(),
      meta_schema: toStringSafe(data.meta_schema).trim(),
      head_tag_manager: toStringSafe(data.head_tag_manager).trim(),
      body_tag_manager: toStringSafe(data.body_tag_manager).trim()
    };
  } catch {
    return {
      meta_title: '',
      meta_description: '',
      meta_schema: '',
      head_tag_manager: '',
      body_tag_manager: ''
    };
  }
});

export const getSeoMeta = ({ pageType, subType = '' } = {}) => {
  const page_type = toStringSafe(pageType).trim().toLowerCase();
  const sub_type = toStringSafe(subType).trim().toLowerCase();
  return getSeoMetaCached(page_type, sub_type);
};


export const normalizeJsonLdString = (value) => {
  const raw = toStringSafe(value).trim();
  if (!raw) return '';

  // Accept either raw JSON-LD or a full <script type="application/ld+json">...</script> snippet.
  if (raw.toLowerCase().includes('<script')) {
    const match = raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const inner = match && match[1] ? String(match[1]).trim() : '';
    if (!inner) return '';

    try {
      return JSON.stringify(JSON.parse(inner));
    } catch {
      return inner;
    }
  }

  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    // Don't drop invalid JSON—return as-is so the user can see/fix it.
    return raw;
  }
};


export const extractFirstScriptBody = (html) => {
  const raw = toStringSafe(html);
  if (!raw.trim()) return '';

  const match = raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (match && match[1]) return String(match[1]).trim();

  // If user pasted raw JS (without <script> wrapper)
  if (!raw.includes('<') && !raw.includes('>')) return raw.trim();

  return '';
};

export const extractFirstNoScriptInnerHtml = (html) => {
  const raw = toStringSafe(html);
  if (!raw.trim()) return '';

  const match = raw.match(/<noscript[^>]*>([\s\S]*?)<\/noscript>/i);
  if (match && match[1]) return String(match[1]).trim();

  // If user pasted only iframe HTML
  if (raw.includes('<iframe')) return raw.trim();

  return '';
};


export const extractScriptBodies = (html) => {
  const raw = toStringSafe(html);
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const bodies = [];
  const reScript = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = reScript.exec(raw))) {
    const body = (match[1] || '').trim();
    if (body) bodies.push(body);
  }

  if (!bodies.length && !raw.includes('<') && !raw.includes('>')) {
    const js = trimmed;
    if (js) bodies.push(js);
  }

  return bodies;
};


export const extractNoScriptInnerHtml = (html) => {
  const raw = toStringSafe(html);
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const match = raw.match(/<noscript[^>]*>([\s\S]*?)<\/noscript>/i);
  if (match && match[1]) return String(match[1]).trim();

  if (raw.includes('<iframe')) return trimmed;

  return '';
};


const toReactAttrName = (name) => {
  const key = String(name || '').trim();
  const lower = key.toLowerCase();

  if (lower === 'class') return 'className';
  if (lower === 'http-equiv') return 'httpEquiv';
  if (lower === 'charset') return 'charSet';
  if (lower === 'crossorigin') return 'crossOrigin';
  if (lower === 'referrerpolicy') return 'referrerPolicy';

  return key;
};

const parseAttributes = (attrString) => {
  const attrs = {};
  const raw = toStringSafe(attrString);
  if (!raw.trim()) return attrs;

  const re = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`]+)))?/g;
  let match;
  while ((match = re.exec(raw))) {
    const name = toReactAttrName(match[1]);
    const value = match[2] ?? match[3] ?? match[4];
    if (value === undefined) {
      attrs[name] = true;
    } else {
      attrs[name] = String(value);
    }
  }
  return attrs;
};

export const extractScripts = (html) => {
  const raw = toStringSafe(html);
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const scripts = [];
  const reScript = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = reScript.exec(raw))) {
    const attrs = parseAttributes(match[1] || '');
    const body = (match[2] || '').trim();
    scripts.push({ attrs, body });
  }

  if (!scripts.length && !raw.includes('<') && !raw.includes('>')) {
    scripts.push({ attrs: {}, body: trimmed });
  }

  return scripts;
};

export const extractNoScripts = (html) => {
  const raw = toStringSafe(html);
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const blocks = [];
  const reNoScript = /<noscript([^>]*)>([\s\S]*?)<\/noscript>/gi;
  let match;
  while ((match = reNoScript.exec(raw))) {
    const attrs = parseAttributes(match[1] || '');
    const body = (match[2] || '').trim();
    blocks.push({ attrs, body });
  }

  // Fallback: allow iframe-only content without a <noscript> wrapper.
  if (!blocks.length && trimmed.includes('<iframe')) {
    blocks.push({ attrs: {}, body: trimmed });
  }

  return blocks;
};
