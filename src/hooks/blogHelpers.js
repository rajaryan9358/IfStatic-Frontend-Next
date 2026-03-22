const assetBase = (process.env.REACT_APP_ASSET_BASE_URL || '').replace(/\/$/, '') ||
  (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

const resolveMediaUrl = (value) => {
  if (!value) return '/sample/2.png';
  const trimmed = value.trim();
  if (!trimmed) return '/sample/2.png';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const prefixed = trimmed.includes('/') ? trimmed : `/uploads/${trimmed}`;
  const normalized = prefixed.startsWith('/') ? prefixed : `/${prefixed}`;
  return assetBase ? `${assetBase}${normalized}` : normalized;
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const slugify = (value = '') => value
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'blog-entry';

export const shapeTopic = (topic = {}) => ({
  id: topic.id,
  name: topic.name || '',
  slug: (topic.slug || '').toLowerCase(),
  description: topic.description || '',
  sortOrder: typeof topic.sortOrder === 'number' ? topic.sortOrder : 0,
  metaTitle: topic.metaTitle || '',
  metaDescription: topic.metaDescription || '',
  metaSchema: topic.metaSchema || ''
});

export const shapeBlog = (item = {}) => {
  const topics = Array.isArray(item.topics) ? item.topics.map(shapeTopic) : [];
  const topicIdsFromTopics = topics.map((topic) => topic.id).filter((id) => Number.isInteger(id));

  const metaTitle = item.metaTitle || item.htmlTitle || '';
  const metaDescription = item.metaDescription || item.htmlMetaTags || '';
  const metaSchema = item.metaSchema || '';

  return {
    id: item.id,
    slug: (item.slug || slugify(item.title || item.id)).toLowerCase(),
    title: item.title || '',
    category: item.category || '',
    excerpt: item.excerpt || '',
    content: item.content || '',
    author: item.author || '',
    date: toDate(item.date) || new Date().toISOString(),
    readTime: item.readTime || '',
    image: resolveMediaUrl(item.image),
    metaTitle,
    metaDescription,
    metaSchema,
    htmlTitle: metaTitle,
    htmlMetaTags: metaDescription,
    tags: Array.isArray(item.tags) ? item.tags : [],
    topics,
    topicIds: Array.isArray(item.topicIds) && item.topicIds.length ? item.topicIds : topicIdsFromTopics
  };
};

export const fallbackBlogs = [];

const isSameBlog = (blog, key) => {
  if (!blog || key == null) return false;
  const normalized = typeof key === 'string' ? key.trim().toLowerCase() : key;
  return blog.id === key || blog.slug === normalized;
};

export const getRecentBlogs = (blogs, excludeKey, count = 4) => {
  const sorted = [...(blogs || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted.filter((blog) => !isSameBlog(blog, excludeKey)).slice(0, count);
};

export const getSimilarBlogs = (blogs, currentBlog, count = 3) => {
  if (!currentBlog) return [];
  const topicSlugs = new Set((currentBlog.topics || []).map((topic) => topic.slug));
  if (!topicSlugs.size) {
    return getRecentBlogs(blogs, currentBlog?.slug || currentBlog?.id, count);
  }
  const sorted = [...(blogs || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const similar = sorted.filter((blog) => {
    if (isSameBlog(blog, currentBlog.slug || currentBlog.id)) return false;
    return (blog.topics || []).some((topic) => topic.slug === undefined ? false : topicSlugs.has(topic.slug));
  });
  if (similar.length >= count) {
    return similar.slice(0, count);
  }
  const filler = getRecentBlogs(blogs, currentBlog.slug || currentBlog.id, count * 2);
  const ids = new Set(similar.map((blog) => blog.id));
  filler.forEach((blog) => {
    if (similar.length < count && !ids.has(blog.id)) {
      similar.push(blog);
      ids.add(blog.id);
    }
  });
  return similar.slice(0, count);
};

export const deriveTopicsFromBlogs = (blogs) => {
  const map = new Map();
  (blogs || []).forEach((blog) => {
    (blog.topics || []).forEach((topic) => {
      if (!topic || !topic.slug) return;
      if (!map.has(topic.slug)) {
        map.set(topic.slug, topic);
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
};
