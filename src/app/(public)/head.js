import React from 'react';
import { headers } from 'next/headers';

import { getSeoMeta, extractScripts, normalizeJsonLdString } from '@/lib/seoMeta.server';
import { mapPathToSeoQuery } from '@/lib/seoRoute';

const toPathname = (rawValue) => {
  const raw = String(rawValue || '').trim();
  if (!raw) return '';

  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return new URL(raw).pathname || '/';
    }
  } catch {}

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

  const host = h.get('x-forwarded-host') || h.get('host') || '';
  const proto = h.get('x-forwarded-proto') || 'http';
  const path = h.get('x-original-uri') || h.get('x-rewrite-url') || '/';

  try {
    const url = new URL(path, host ? `${proto}://${host}` : `${proto}://localhost`);
    const pathname = url.pathname || '/';
    if (pathname !== '/') return pathname;
  } catch {}

  return '/';
};

export default async function Head() {
  const pathname = await getPathnameFromHeaders();
  const { pageType, subType } = mapPathToSeoQuery(pathname);
  const meta = await getSeoMeta({ pageType, subType });

  const headTagManagerScripts = extractScripts(meta.head_tag_manager);

  const rawSchema = String(meta.meta_schema || '').trim();
  const schemaFromFullScript = /<script\b/i.test(rawSchema) ? extractScripts(rawSchema) : [];
  const normalizedSchema = schemaFromFullScript.length ? '' : normalizeJsonLdString(rawSchema);

  return (
    <>
      {headTagManagerScripts.map((script, index) => (
        <script
          key={`head-tag-manager-${index}`}
          suppressHydrationWarning
          {...script.attrs}
          dangerouslySetInnerHTML={{ __html: script.body }}
        />
      ))}

      {schemaFromFullScript.length
        ? schemaFromFullScript.map((script, index) => (
            <script
              key={`schema-json-${index}`}
              suppressHydrationWarning
              {...script.attrs}
              dangerouslySetInnerHTML={{ __html: script.body }}
            />
          ))
        : null}

      {!schemaFromFullScript.length && normalizedSchema ? (
        <script
          type="application/ld+json"
          data-ifstatic-seo="jsonld"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: normalizedSchema }}
        />
      ) : null}
    </>
  );
}
