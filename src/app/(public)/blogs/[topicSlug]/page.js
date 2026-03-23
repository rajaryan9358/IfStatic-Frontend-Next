import BlogsPage from '@/views/BlogsPage';
import {
  fetchBlogsServer,
  fetchBlogTopicBySlugServer,
  fetchBlogTopicsServer,
} from '@/services/publicData.service';
import { getSeoMeta } from '@/lib/seoMeta.server';
import { redirect } from 'next/navigation';

const normalizeTopicSlug = (value = '') =>
  decodeURIComponent(String(value))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
};

export async function generateMetadata({ params }) {
  const resolvedParams = (await params) || {};
  const topicSlug = resolvedParams.topicSlug || '';
  const normalized = normalizeTopicSlug(topicSlug);

  if (normalized === 'all') {
    return {};
  }

  const [topic, meta] = await Promise.all([
    fetchBlogTopicBySlugServer(normalized),
    getSeoMeta({ pageType: 'blogs', subType: normalized }),
  ]);

  return {
    title: toNonEmptyString(topic?.metaTitle) || toNonEmptyString(meta?.meta_title),
    description: toNonEmptyString(topic?.metaDescription) || toNonEmptyString(meta?.meta_description),
  };
}

export default async function BlogsTopicRoute({ params }) {
  const resolvedParams = (await params) || {};
  const topicSlug = resolvedParams.topicSlug || '';
  const normalized = normalizeTopicSlug(topicSlug);

  if (normalized === 'all') {
    redirect('/blogs');
  }

  const [topic, blogsResult, topics] = await Promise.all([
    fetchBlogTopicBySlugServer(normalized),
    fetchBlogsServer(),
    fetchBlogTopicsServer(),
  ]);

  if (!topic) {
    redirect('/blogs');
  }

  return (
    <><BlogsPage
        topicSlug={normalized}
        initialBlogs={blogsResult.data}
        initialTopics={topics}
        initialIsFallback={blogsResult.isFallback}
      />
    </>
  );
}
