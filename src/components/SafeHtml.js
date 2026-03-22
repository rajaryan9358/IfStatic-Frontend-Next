'use client';

import React from 'react';

import { stripForbiddenHeadTags } from '@/lib/stripForbiddenHeadTags';

export default function SafeHtml({
  as: Component = 'div',
  html = '',
  className,
  suppressHydrationWarning = true,
  ...props
}) {
  const raw = typeof html === 'string' ? html : String(html ?? '');
  const sanitized = stripForbiddenHeadTags(raw);

  return (
    <Component
      className={className}
      suppressHydrationWarning={suppressHydrationWarning}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      {...props}
    />
  );
}
