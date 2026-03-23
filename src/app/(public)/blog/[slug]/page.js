import BlogDetails from '@/views/BlogDetails';
import { fetchBlogBySlugServer, fetchBlogsServer } from '@/services/publicData.service';

const getSlug = (resolvedParams) =>
  resolvedParams?.slug ? String(resolvedParams.slug) : '';

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
};

export async function generateMetadata({ params }) {
  const resolvedParams = (await params) || {};
  const slug = getSlug(resolvedParams);
  const blog = await fetchBlogBySlugServer(slug);

  return {
    title: toNonEmptyString(blog?.metaTitle),
    description: toNonEmptyString(blog?.metaDescription),
  };
}

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
