import BlogsPage from '@/views/BlogsPage';
import {
  fetchBlogsServer,
  fetchBlogTopicBySlugServer,
  fetchBlogTopicsServer,
} from '@/services/publicData.service';
import { redirect } from 'next/navigation';

const normalizeTopicSlug = (value = '') =>
  decodeURIComponent(String(value))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

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
