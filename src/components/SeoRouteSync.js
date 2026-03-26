'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getPublicApiBaseCandidates, resolvePublicApiUrl } from '@/lib/publicApiBase';
import { mapPathToSeoQuery } from '@/lib/seoRoute';

const toStringSafe = (value) => (typeof value === 'string' ? value : value == null ? '' : String(value));

const stripComments = (html) => toStringSafe(html).replace(/<!--([\s\S]*?)-->/g, '');

const stripForbiddenTags = (html) =>
  toStringSafe(html)
    .replace(/<\s*\/?\s*(html|head|body)\b[^>]*>/gi, '')
    .replace(/<\s*title\b[^>]*>[\s\S]*?<\s*\/\s*title\s*>/gi, '')
    .replace(/<\s*meta\b[^>]*>/gi, '')
    .replace(/<\s*link\b[^>]*>/gi, '')
    .replace(/<\s*base\b[^>]*>/gi, '');

const extractFirstScriptContent = (html) => {
  const cleaned = stripForbiddenTags(stripComments(html)).trim();
  if (!cleaned) return '';

  const match = cleaned.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  if (match?.[1]) return String(match[1]).trim();
  if (!cleaned.includes('<') && !cleaned.includes('>')) return cleaned;
  return '';
};

const extractNoScriptInner = (html) => {
  const cleaned = stripForbiddenTags(stripComments(html)).trim();
  if (!cleaned) return '';

  const match = cleaned.match(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/i);
  if (match?.[1]) return String(match[1]).trim();
  if (cleaned.includes('<iframe')) return cleaned;
  return '';
};

const safeJsonLd = (jsonString) => {
  const raw = toStringSafe(jsonString).trim();
  if (!raw) return '';

  let candidate = raw;
  if (candidate.toLowerCase().includes('<script')) {
    const match = candidate.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    candidate = match?.[1] ? String(match[1]).trim() : '';
  }

  if (!candidate) return '';

  try {
    return JSON.stringify(JSON.parse(candidate)).replace(/<\/script/gi, '<\\/script');
  } catch {
    return '';
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

const upsertHeadScript = ({ id, dataType, content, type }) => {
  let script = document.head.querySelector(`#${id}`);

  if (!script) {
    script = document.createElement('script');
    script.id = id;
    document.head.appendChild(script);
  }

  if (dataType) {
    script.dataset.ifstaticSeo = dataType;
  }

  if (type) {
    script.type = type;
  } else {
    script.removeAttribute('type');
  }

  script.textContent = toStringSafe(content);
};

const upsertBodyNoScript = (content) => {
  let noScript = document.body.querySelector('#ifstatic-body-tag-manager');

  if (!noScript) {
    noScript = document.createElement('noscript');
    noScript.id = 'ifstatic-body-tag-manager';
    noScript.dataset.ifstaticBodyTagManager = 'true';
    document.body.prepend(noScript);
  }

  noScript.innerHTML = toStringSafe(content);
};

const applySeoMetaToDom = (meta) => {
  const title = toStringSafe(meta?.meta_title).trim();
  if (title) {
    document.title = title;
  }

  upsertDescription(meta?.meta_description);

  const headScript = extractFirstScriptContent(meta?.head_tag_manager);
  upsertHeadScript({ id: 'gtm', dataType: 'head-tag-manager', content: headScript });

  const jsonLd = safeJsonLd(meta?.meta_schema);
  upsertHeadScript({ id: 'jsonld', dataType: 'jsonld', type: 'application/ld+json', content: jsonLd });

  const noScriptInner = extractNoScriptInner(meta?.body_tag_manager);
  upsertBodyNoScript(noScriptInner);
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
        return;
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