import React from 'react';
import { cache } from 'react';
import Script from 'next/script';
import { headers } from 'next/headers';

import DevSeoBodyGuard from '@/components/DevSeoBodyGuard';
import SeoRouteSync from '@/components/SeoRouteSync';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchServicesMinimalServer } from '@/services/publicData.service';
import { getSeoMeta } from '@/lib/seoMeta.server';
import { mapPathToSeoQuery } from '@/lib/seoRoute';
import {
  extractFirstScriptContent,
  extractNoScriptBlock,
  safeJsonLd,
} from '@/lib/seoSanitize.server';

export const dynamic = 'force-dynamic';

const getSeoMetaCached = cache(async (pageType, subType) =>
  getSeoMeta({ pageType, subType })
);

const toPathname = (rawValue) => {
  const raw = String(rawValue || '').trim();
  if (!raw) return '';

  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return new URL(raw).pathname || '/';
    }
  } catch {}

  // If we get something like "/path?x=1" keep only the pathname.
  return raw.split('?')[0] || '/';
};

const getPathnameFromHeaders = async () => {
  const h = await headers();

  const candidates = [
    'x-seo-pathname',
    'next-url',
    'x-nextjs-pathname',
    'x-invoke-path',
    'x-matched-path',
    'x-original-uri',
    'x-rewrite-url',
    'x-forwarded-uri',
    'x-forwarded-path',
    'request-uri',
  ];

  for (const name of candidates) {
    const value = h.get(name);
    const pathname = toPathname(value);
    if (pathname && pathname !== '/') return pathname;
  }

  // Fallback: reconstruct from host + path-ish headers.
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  const proto = h.get('x-forwarded-proto') || 'http';
  const path = h.get('x-original-uri') || h.get('x-rewrite-url') || '/';

  try {
    const url = new URL(path, host ? `${proto}://${host}` : `${proto}://localhost`);
    const pathname = url.pathname || '/';
    if (pathname !== '/') return pathname;
  } catch {}

  // Dev-only: help us identify the correct header in this environment.
  if (process.env.NODE_ENV !== 'production') {
    const debug = {};
    for (const name of candidates) debug[name] = h.get(name);
    // eslint-disable-next-line no-console
    console.log('[SEO] Could not derive pathname from headers; defaulting to /', debug);
  }

  return '/';
};

export async function generateMetadata() {
  const pathname = await getPathnameFromHeaders();
  const { pageType, subType } = mapPathToSeoQuery(pathname);
  const meta = await getSeoMetaCached(pageType, subType);

  return {
    title: meta.meta_title ? { absolute: meta.meta_title } : undefined,
    description: meta.meta_description || undefined,
  };
}

export default async function PublicLayout({ children }) {
  const services = await fetchServicesMinimalServer();

  const pathname = await getPathnameFromHeaders();
  const { pageType, subType } = mapPathToSeoQuery(pathname);
  const meta = await getSeoMetaCached(pageType, subType);

  const gtmHeadJs = extractFirstScriptContent(meta.head_tag_manager);
  const gtmNoScriptBlock = extractNoScriptBlock(meta.body_tag_manager);
  const jsonLd = safeJsonLd(meta.meta_schema);

  const gtmNoScriptInner = (() => {
    const raw = String(gtmNoScriptBlock || '').trim();
    if (!raw) return '';
    const m = raw.match(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/i);
    if (m && m[1]) return String(m[1]).trim();
    return raw;
  })();

  return (
    <>
      {process.env.NODE_ENV !== 'production' ? <DevSeoBodyGuard /> : null}
      <SeoRouteSync initialPathname={pathname} initialMeta={meta} />
      {/* body_tag_manager must be FIRST inside <body> */}
      {gtmNoScriptInner ? (
        <noscript id="ifstatic-body-tag-manager" data-ifstatic-body-tag-manager="true" dangerouslySetInnerHTML={{ __html: gtmNoScriptInner }} />
      ) : null}

      {/* head_tag_manager: GTM script in <head> */}
      {gtmHeadJs ? (
        <Script id="gtm" data-ifstatic-seo="head-tag-manager" strategy="beforeInteractive">
          {gtmHeadJs}
        </Script>
      ) : null}

      {/* schema: JSON-LD in <head> */}
      {jsonLd ? (
        <Script
          id="jsonld"
          type="application/ld+json"
          data-ifstatic-seo="jsonld"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}

      <Header services={services} />
      <main style={{ padding: 20 }}>{children}</main>
      <Footer services={services} />
    </>
  );
}
