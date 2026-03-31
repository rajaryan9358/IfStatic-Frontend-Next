'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getPublicApiBaseCandidates, resolvePublicApiUrl } from '@/lib/publicApiBase';
import { mapPathToSeoQuery } from '@/lib/seoRoute';

const toStringSafe = (value) => (typeof value === 'string' ? value : value == null ? '' : String(value));

const toReactAttrName = (name) => {
  const key = String(name || '').trim();
  const lower = key.toLowerCase();

  if (lower === 'classname') return 'class';
  if (lower === 'httpEquiv') return 'http-equiv';
  if (lower === 'charSet') return 'charset';
  if (lower === 'crossOrigin') return 'crossorigin';
  if (lower === 'referrerPolicy') return 'referrerpolicy';
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
    attrs[name] = value === undefined ? '' : String(value);
  }

  return attrs;
};

const extractScripts = (html) => {
  const raw = toStringSafe(html).trim();
  if (!raw) return [];

  const scripts = [];
  const reScript = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = reScript.exec(raw))) {
    scripts.push({ attrs: parseAttributes(match[1] || ''), body: String(match[2] || '').trim() });
  }

  if (!scripts.length && !raw.includes('<') && !raw.includes('>')) {
    scripts.push({ attrs: {}, body: raw });
  }

  return scripts;
};

const normalizeNoScriptBody = (value) => {
  let output = toStringSafe(value).trim();
  if (!output) return '';

  output = output
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\\"/g, '"');

  const isWrappedInQuotes =
    (output.startsWith('"') && output.endsWith('"')) ||
    (output.startsWith("'") && output.endsWith("'"));

  if (isWrappedInQuotes) {
    const inner = output.slice(1, -1).trim();
    if (inner.includes('<iframe')) output = inner;
  }

  return output;
};

const extractNoScripts = (html) => {
  const raw = toStringSafe(html).trim();
  if (!raw) return [];

  const blocks = [];
  const reNoScript = /<noscript([^>]*)>([\s\S]*?)<\/noscript>/gi;
  let match;
  while ((match = reNoScript.exec(raw))) {
    blocks.push({ attrs: parseAttributes(match[1] || ''), body: normalizeNoScriptBody(match[2] || '') });
  }

  if (!blocks.length && raw.includes('<iframe')) {
    blocks.push({ attrs: {}, body: normalizeNoScriptBody(raw) });
  }

  return blocks;
};

const normalizeJsonLdString = (value) => {
  const raw = toStringSafe(value).trim();
  if (!raw) return '';

  if (raw.toLowerCase().includes('<script')) {
    const match = raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const inner = match?.[1] ? String(match[1]).trim() : '';
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
    return raw;
  }
};

const upsertDescription = (content) => {
  const value = toStringSafe(content).trim();
  let el = document.head.querySelector('meta[name="description"]');

  if (!value) {
    if (el) {
      el.setAttribute('content', '');
    }
    return;
  }

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }

  el.setAttribute('content', value);
};

const removeManagedHeadScripts = (dataType) => {
  document.head
    .querySelectorAll(`script[data-ifstatic-seo="${dataType}"]`)
    .forEach((node) => node.remove());
};

const appendManagedHeadScripts = (dataType, scripts) => {
  removeManagedHeadScripts(dataType);

  scripts.forEach(({ attrs = {}, body = '' }) => {
    const script = document.createElement('script');
    script.dataset.ifstaticSeo = dataType;

    Object.entries(attrs).forEach(([key, value]) => {
      if (value === '') {
        script.setAttribute(key, '');
      } else {
        script.setAttribute(key, String(value));
      }
    });

    script.textContent = toStringSafe(body);
    document.head.appendChild(script);
  });
};

const replaceManagedBodyNoScripts = (blocks) => {
  document.body
    .querySelectorAll('noscript[data-ifstatic-body-tag-manager="true"]')
    .forEach((node) => node.remove());

  if (!blocks.length) return;

  const fragment = document.createDocumentFragment();
  blocks.forEach(({ attrs = {}, body = '' }) => {
    const noScript = document.createElement('noscript');
    noScript.dataset.ifstaticBodyTagManager = 'true';

    Object.entries(attrs).forEach(([key, value]) => {
      if (value === '') {
        noScript.setAttribute(key, '');
      } else {
        noScript.setAttribute(key, String(value));
      }
    });

    noScript.innerHTML = toStringSafe(body);
    fragment.appendChild(noScript);
  });

  document.body.prepend(fragment);
};

const applySeoMetaToDom = (meta) => {
  const title = toStringSafe(meta?.meta_title).trim();
  if (title) {
    document.title = title;
  }

  upsertDescription(meta?.meta_description);

  const headScripts = extractScripts(meta?.head_tag_manager);
  appendManagedHeadScripts('head-tag-manager', headScripts);

  const rawSchema = toStringSafe(meta?.meta_schema).trim();
  const schemaAsScripts = /<script\b/i.test(rawSchema) ? extractScripts(rawSchema) : [];
  if (schemaAsScripts.length) {
    appendManagedHeadScripts('jsonld', schemaAsScripts);
  } else {
    const normalizedSchema = normalizeJsonLdString(rawSchema);
    const fallback = normalizedSchema
      ? [{ attrs: { type: 'application/ld+json' }, body: normalizedSchema }]
      : [];
    appendManagedHeadScripts('jsonld', fallback);
  }

  const noScriptBlocks = extractNoScripts(meta?.body_tag_manager);
  replaceManagedBodyNoScripts(noScriptBlocks);
};

const fetchSeoMeta = async (pathname) => {
  const { pageType, subType } = mapPathToSeoQuery(pathname);
  const baseCandidates = getPublicApiBaseCandidates().map((base) => resolvePublicApiUrl(base, '/meta'));

  for (const basePath of baseCandidates) {
    try {
      const url = new URL(basePath, window.location.origin);
      url.searchParams.set('page_type', pageType);
      if (subType) url.searchParams.set('sub_type', subType);

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          continue;
        }
        break;
      }

      const json = await res.json().catch(() => ({}));
      return json?.data || {};
    } catch {
      continue;
    }
  }

  return {
    meta_title: '',
    meta_description: '',
    meta_schema: '',
    head_tag_manager: '',
    body_tag_manager: '',
  };
};

export default function SeoRouteSync({ initialPathname = '/', initialMeta = null }) {
  const pathname = usePathname() || '/';
  const initialAppliedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const syncSeo = async () => {
      if (!initialAppliedRef.current && pathname === initialPathname && initialMeta) {
        applySeoMetaToDom(initialMeta);
        initialAppliedRef.current = true;
      }

      const meta = await fetchSeoMeta(pathname);
      if (!active) return;
      applySeoMetaToDom(meta);
      initialAppliedRef.current = true;
    };

    syncSeo();

    return () => {
      active = false;
    };
  }, [initialMeta, initialPathname, pathname]);

  return null;
}