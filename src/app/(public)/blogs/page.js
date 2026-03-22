import BlogsPage from '@/views/BlogsPage';
import { fetchBlogsServer, fetchBlogTopicsServer } from '@/services/publicData.service';

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
