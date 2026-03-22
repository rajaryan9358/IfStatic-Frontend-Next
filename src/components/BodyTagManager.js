import SafeHtml from '@/components/SafeHtml';
import { extractNoScripts } from '@/lib/seoMeta.server';

export default function BodyTagManager({ html }) {
  const blocks = extractNoScripts(html);
  if (!blocks.length) return null;

  return (
    <>
      {blocks.map((block, index) => (
        <SafeHtml
          // Must stay <noscript> for GTM.
          as="noscript"
          key={`body-tag-manager-${index}`}
          {...block.attrs}
          html={block.body}
        />
      ))}
    </>
  );
}
