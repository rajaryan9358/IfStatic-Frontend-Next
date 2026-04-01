import React from 'react';
import { headers } from 'next/headers';

import BodyTagManager from '@/components/BodyTagManager';
import DevSeoBodyGuard from '@/components/DevSeoBodyGuard';
import SeoRouteSync from '@/components/SeoRouteSync';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchServicesMinimalServer } from '@/services/publicData.service';
import { getSeoMeta } from '@/lib/seoMeta.server';
import { mapPathToSeoQuery } from '@/lib/seoRoute';

export const dynamic = 'force-dynamic';

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
  const meta = await getSeoMeta({ pageType, subType });

  return {
    title: meta.meta_title ? { absolute: meta.meta_title } : undefined,
    description: meta.meta_description || undefined,
    verification: {
      google: 'fSOaEIINcaxtyfbDRIqZuyd374xfUxUYFDvmpm3St6o',
    },
  };
}

export default async function PublicLayout({ children }) {
  const services = await fetchServicesMinimalServer();

  const pathname = await getPathnameFromHeaders();
  const { pageType, subType } = mapPathToSeoQuery(pathname);
  const meta = await getSeoMeta({ pageType, subType });

  return (
    <>
      {process.env.NODE_ENV !== 'production' ? <DevSeoBodyGuard /> : null}
      <SeoRouteSync initialPathname={pathname} initialMeta={meta} />
      {/* body_tag_manager must be FIRST inside <body> */}
      <BodyTagManager html={meta.body_tag_manager} />

      <Header services={services} />
      <main style={{ padding: 0, margin: 0 }}>{children}</main>
      <Footer services={services} />
    </>
  );
}
