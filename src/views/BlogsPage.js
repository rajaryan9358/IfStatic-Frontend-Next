"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { deriveTopicsFromBlogs, shapeBlog, shapeTopic } from '../hooks/blogHelpers';
import RichText from '../components/RichText';
import { useResponsiveSectionVariants } from '../lib/useResponsiveSectionVariants';

const sectionTransition = (delay = 0) => ({
  duration: 0.5,
  ease: 'easeOut',
  delay,
});

const normalizeTopicSlug = (value = '') =>
  decodeURIComponent(String(value))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

const BlogsPage = ({
  topicSlug = '',
  initialBlogs = null,
  initialTopics = null,
  initialIsFallback = false,
} = {}) => {
  const router = useRouter();
  const sectionVariants = useResponsiveSectionVariants();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const blogsPerPage = 6;

  const allBlogs = useMemo(() => {
    if (Array.isArray(initialBlogs) && initialBlogs.length) {
      return initialBlogs.map(shapeBlog);
    }
    return [];
  }, [initialBlogs]);

  const topics = useMemo(() => {
    if (Array.isArray(initialTopics) && initialTopics.length) {
      return initialTopics.map(shapeTopic);
    }
    return deriveTopicsFromBlogs(allBlogs) || [];
  }, [initialTopics, allBlogs]);

  const normalizedTopicSlugFromUrl = useMemo(() => normalizeTopicSlug(topicSlug || ''), [topicSlug]);

  const topicTabs = useMemo(
    () => [{ slug: 'all', name: 'All Topics' }, ...topics.map((t) => ({ ...t, slug: normalizeTopicSlug(t.slug) }))],
    [topics]
  );

  const topicFilterSlug = useMemo(() => {
    if (!normalizedTopicSlugFromUrl || normalizedTopicSlugFromUrl === 'all') return '';
    return normalizedTopicSlugFromUrl;
  }, [normalizedTopicSlugFromUrl]);

  const blogs = useMemo(() => {
    let list = Array.isArray(allBlogs) ? allBlogs : [];

    if (topicFilterSlug) {
      list = list.filter((blog) => {
        const topicObjs = Array.isArray(blog?.topics) ? blog.topics : [];
        const tags = Array.isArray(blog?.tags) ? blog.tags : [];

        const topicMatch = topicObjs.some((t) => normalizeTopicSlug(t?.slug) === topicFilterSlug);
        const tagMatch = tags.some((t) => normalizeTopicSlug(t) === topicFilterSlug);

        return topicMatch || tagMatch;
      });
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (normalizedSearch) {
      list = list.filter((blog) => {
        const title = String(blog?.title || '').toLowerCase();
        const excerpt = String(blog?.excerpt || '').toLowerCase();
        const author = String(blog?.author || '').toLowerCase();
        const tags = Array.isArray(blog?.tags) ? blog.tags.join(' ').toLowerCase() : '';
        const haystack = `${title} ${excerpt} ${author} ${tags}`;
        return haystack.includes(normalizedSearch);
      });
    }

    return list;
  }, [allBlogs, topicFilterSlug, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [topicFilterSlug, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(blogs.length / blogsPerPage));
  const startIndex = (currentPage - 1) * blogsPerPage;
  const displayedBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);

  const handleTopicChange = (nextTopicSlug) => {
    const next = normalizeTopicSlug(nextTopicSlug);
    setCurrentPage(1);

    if (next === 'all' || !next) {
      router.push('/blogs');
      return;
    }

    router.push(`/blogs/${next}`);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleBlogClick = (blogSlug) => {
    if (!blogSlug) return;
    router.push(`/blog/${blogSlug}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <main className="blogs-page">
      <motion.section
        className="blogs-header"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={sectionTransition(0)}
      >
        <div className="blogs-header-inner">
          <h1 className="blogs-title">Our Blog</h1>
          <p className="blogs-description">
            Insights, stories, and expertise from our team. Stay updated with the latest trends in technology, design, and
            digital innovation. Discover how we help businesses transform and grow.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="blogs-content"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.05)}
      >
        <div className="blogs-container">
          <motion.div
            className="blogs-filters"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.1)}
          >
            {topicTabs.map((topic) => (
              <button
                key={topic.slug}
                className={`filter-btn ${(!topicFilterSlug && topic.slug === 'all') || topicFilterSlug === topic.slug ? 'active' : ''}`}
                onClick={() => handleTopicChange(topic.slug)}
              >
                {topic.name}
              </button>
            ))}
          </motion.div>

          <motion.div
            className="blogs-toolbar"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.15)}
          >
            <div className="blogs-search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M9.16667 15.8333C12.8485 15.8333 15.8333 12.8485 15.8333 9.16667C15.8333 5.48477 12.8485 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8485 5.48477 15.8333 9.16667 15.8333Z"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.5 17.5L13.875 13.875"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search articles by title, author, or tags"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </motion.div>

          {initialIsFallback && allBlogs.length > 0 && (
            <p className="blogs-status muted">Showing default blog posts until new articles are published.</p>
          )}

          <motion.div
            className="blogs-grid"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.2)}
          >
            {displayedBlogs.length ? (
                displayedBlogs.map((blog) => (
              <article
                key={blog.id || blog.slug}
                className="blog-card"
                role="button"
                tabIndex={0}
                onClick={() => handleBlogClick(blog.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleBlogClick(blog.slug);
                }}
              >
                <div className="blog-card-image">
                  <img
                    src={blog.coverImage || blog.image || '/sample/2.png'}
                    alt={blog.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="blog-card-content">
                  <p className="blog-card-meta">
                    <span>{blog.author}</span>
                    {blog.publishedAt ? <span>• {formatDate(blog.publishedAt)}</span> : null}
                  </p>
                  <RichText as="h3" className="blog-card-title" content={blog.title} />
                  <RichText as="p" className="blog-card-excerpt" content={blog.excerpt} />
                  <span className="blog-card-link">Read more</span>
                </div>
              </article>
            ))
            ) : (
              <div className="blogs-empty-state">No blogs for this topic yet.</div>
            )}
          </motion.div>

          {totalPages > 1 && (
            <div className="blogs-pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-status">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.section>
    </main>
  );
};

export default BlogsPage;
