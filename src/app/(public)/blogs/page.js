import BlogsPage from '@/views/BlogsPage';
import { fetchBlogsServer, fetchBlogTopicsServer } from '@/services/publicData.service';
import { getSeoMeta } from '@/lib/seoMeta.server';

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
};

export async function generateMetadata() {
  const meta = await getSeoMeta({ pageType: 'blogs', subType: '' });

  return {
    title: toNonEmptyString(meta?.meta_title),
    description: toNonEmptyString(meta?.meta_description),
  };
}

export default async function BlogsRoute() {
  const [{ data, isFallback }, topics] = await Promise.all([
    fetchBlogsServer(),
    fetchBlogTopicsServer(),
  ]);

  return (
    <><BlogsPage initialBlogs={data} initialTopics={topics} initialIsFallback={isFallback} />
    </>
  );
}
