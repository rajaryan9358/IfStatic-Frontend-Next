'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
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

const removeManagedSeoTags = () => {
  document.head.querySelectorAll('script#gtm, script#jsonld, script[data-ifstatic-seo]').forEach((node) => node.remove());
  document.body.querySelectorAll('noscript[data-ifstatic-body-tag-manager]').forEach((node) => node.remove());
};

const upsertDescription = (content) => {
  const value = toStringSafe(content).trim();
  let el = document.head.querySelector('meta[name="description"]');

  if (!value) {
    el?.remove();
    return;
  }

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }

  el.setAttribute('content', value);
};

const applySeoMetaToDom = (meta) => {
  removeManagedSeoTags();

  const title = toStringSafe(meta?.meta_title).trim();
  if (title) {
    document.title = title;
  }

  upsertDescription(meta?.meta_description);

  const headScript = extractFirstScriptContent(meta?.head_tag_manager);
  if (headScript) {
    const script = document.createElement('script');
    script.id = 'gtm';
    script.dataset.ifstaticSeo = 'head-tag-manager';
    script.text = headScript;
    document.head.appendChild(script);
  }

  const jsonLd = safeJsonLd(meta?.meta_schema);
  if (jsonLd) {
    const script = document.createElement('script');
    script.id = 'jsonld';
    script.type = 'application/ld+json';
    script.dataset.ifstaticSeo = 'jsonld';
    script.text = jsonLd;
    document.head.appendChild(script);
  }

  const noScriptInner = extractNoScriptInner(meta?.body_tag_manager);
  if (noScriptInner) {
    const noScript = document.createElement('noscript');
    noScript.dataset.ifstaticBodyTagManager = 'true';
    noScript.innerHTML = noScriptInner;
    document.body.prepend(noScript);
  }
};

const fetchSeoMeta = async (pathname) => {
  const { pageType, subType } = mapPathToSeoQuery(pathname);
  const url = new URL('/api/backend/public/meta', window.location.origin);
  url.searchParams.set('page_type', pageType);
  if (subType) url.searchParams.set('sub_type', subType);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    return {
      meta_title: '',
      meta_description: '',
      meta_schema: '',
      head_tag_manager: '',
      body_tag_manager: '',
    };
  }

  const json = await res.json().catch(() => ({}));
  return json?.data || {};
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