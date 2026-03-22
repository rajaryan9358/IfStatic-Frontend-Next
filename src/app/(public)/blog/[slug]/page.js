import BlogDetails from '@/views/BlogDetails';
import { fetchBlogBySlugServer, fetchBlogsServer } from '@/services/publicData.service';

const getSlug = (resolvedParams) =>
  resolvedParams?.slug ? String(resolvedParams.slug) : '';

export default async function BlogDetailsRoute({ params }) {
  const resolvedParams = (await params) || {};
  const slug = getSlug(resolvedParams);

  const [blog, blogsResult] = await Promise.all([
    fetchBlogBySlugServer(slug),
    fetchBlogsServer(),
  ]);

  return (
    <><BlogDetails
        slug={slug}
        initialBlog={blog}
        initialBlogs={blogsResult.data}
        initialBlogsFallback={blogsResult.isFallback}
      />
    </>
  );
}
