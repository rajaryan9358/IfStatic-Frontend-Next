import React from 'react';

import SafeHtml from '@/components/SafeHtml';

const normalizeHtmlForHydration = (html) => {
  if (!html) return '';

  let output = String(html);

  output = output.replace(/\r\n/g, '\n');
  output = output.replace(/<br\s*\/?>/gi, '<br>');

  output = output.replace(/\s([\w:-]+)='([^']*)'/g, (_match, attr, value) => {
    const escaped = String(value).replace(/"/g, '&quot;');
    return ` ${attr}="${escaped}"`;
  });

  return output;
};

const containsBlockHtml = (html) =>
  /<(\s*)?(address|article|aside|blockquote|details|dialog|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|thead|tbody|tfoot|tr|td|th|ul)\b/i.test(
    String(html || '')
  );

const RichText = ({ as: Component = 'div', content = '', className, ...props }) => {
  const raw = typeof content === 'string' ? content : String(content ?? '');
  const normalized = normalizeHtmlForHydration(raw);

  const isStringTag = typeof Component === 'string';
  const shouldAvoidP =
    isStringTag && Component.toLowerCase() === 'p' && containsBlockHtml(normalized);
  const SafeComponent = shouldAvoidP ? 'div' : Component;

  return (
    <SafeHtml
      as={SafeComponent}
      className={className}
      html={normalized}
      {...props}
    />
  );
};

export default RichText;
