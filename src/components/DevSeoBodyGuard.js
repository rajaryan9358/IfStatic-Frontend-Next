'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MAX_SNIPPET = 1500;

const cssPath = (el) => {
  if (!el || el.nodeType !== 1) return '';
  const parts = [];
  let cur = el;
  while (cur && cur.nodeType === 1 && cur.tagName.toLowerCase() !== 'body') {
    const tag = cur.tagName.toLowerCase();
    const id = cur.id ? `#${cur.id}` : '';
    const cls =
      cur.classList && cur.classList.length
        ? '.' + Array.from(cur.classList).slice(0, 3).join('.')
        : '';
    parts.unshift(`${tag}${id}${cls}`);
    cur = cur.parentElement;
  }
  return parts.join(' > ');
};

const firstMeaningfulElement = (node) => {
  if (!node) return null;
  if (node.nodeType === 1) return node;
  if (node.nodeType === 3) return node.parentElement;
  return null;
};

const findInjectionFromMutations = (mutations) => {
  for (const m of mutations) {
    // Prefer a node that directly contains the forbidden tags.
    for (const added of m.addedNodes || []) {
      const el = firstMeaningfulElement(added);
      if (!el) continue;

      if (el.matches?.('title, meta[name="description"]')) return el;
      if (el.querySelector?.('title, meta[name="description"]')) return el;
    }

    // Fallback: mutation target container.
    const targetEl = firstMeaningfulElement(m.target);
    if (targetEl?.querySelector?.('title, meta[name="description"]')) return targetEl;
  }
  return null;
};

const report = ({ pathname, titleInBody, descInBody, container }) => {
  const containerHtml = container?.outerHTML || '';

  // eslint-disable-next-line no-console
  console.error('[SEO Guard] Forbidden head tags rendered inside <body>', {
    pathname,
    titleInBody: Boolean(titleInBody),
    metaDescriptionInBody: Boolean(descInBody),
    containerPath: cssPath(container),
    containerHtmlSnippet: String(containerHtml).slice(0, MAX_SNIPPET),
  });

  // eslint-disable-next-line no-console
  console.trace('[SEO Guard] stack trace');
};

export default function DevSeoBodyGuard() {
  const pathname = usePathname();

  useEffect(() => {
    let lastKey = '';

    const check = (mutations) => {
      const titleInBody = document.querySelector('body title');
      const descInBody = document.querySelector('body meta[name="description"]');

      if (!titleInBody && !descInBody) return;

      const injection = mutations ? findInjectionFromMutations(mutations) : null;
      const container =
        injection || titleInBody?.parentElement || descInBody?.parentElement || document.body;

      const key = `${pathname}::${Boolean(titleInBody)}::${Boolean(descInBody)}::${cssPath(container)}::${
        container?.outerHTML?.length || 0
      }`;
      if (key === lastKey) return;
      lastKey = key;

      report({ pathname, titleInBody, descInBody, container });
    };

    // Initial check after hydration.
    check(null);

    const observer = new MutationObserver((mutations) => check(mutations));
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
