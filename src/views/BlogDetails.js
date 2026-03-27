"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getRecentBlogs, getSimilarBlogs, shapeBlog } from '../hooks/blogHelpers';
import RichText from '../components/RichText';
import { useResponsiveSectionVariants } from '../lib/useResponsiveSectionVariants';

const sectionTransition = (delay = 0) => ({
  duration: 0.5,
  ease: 'easeOut',
  delay
});

const BlogDetails = ({ slug = '', initialBlog = null, initialBlogs = null, initialBlogsFallback = false, disableClientFetch = false }) => {
  const slugOrId = slug || '';
  const router = useRouter();
  const sectionVariants = useResponsiveSectionVariants();
  const [searchQuery, setSearchQuery] = useState('');
  const numericId = slugOrId && /^\d+$/.test(slugOrId) ? slugOrId : undefined;

  const blog = useMemo(() => (initialBlog ? shapeBlog(initialBlog) : null), [initialBlog]);
  const allBlogs = useMemo(
    () => (Array.isArray(initialBlogs) ? initialBlogs.map(shapeBlog) : []),
    [initialBlogs]
  );

  const isLoading = false;
  const error = '';
  const isFallback = Boolean(initialBlogsFallback);


  const recentBlogs = useMemo(
    () => getRecentBlogs(allBlogs, blog?.slug || blog?.id, 4),
    [allBlogs, blog?.slug, blog?.id]
  );
  const similarBlogs = useMemo(() => getSimilarBlogs(allBlogs, blog, 3), [allBlogs, blog]);

  const searchResults = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return recentBlogs;
    }
    const excludeKey = blog?.slug || blog?.id;
    return allBlogs
      .filter((entry) => (entry.slug || entry.id) !== excludeKey)
      .filter((entry) => entry.title.toLowerCase().includes(normalized))
      .slice(0, 4);
  }, [searchQuery, allBlogs, blog?.slug, blog?.id, recentBlogs]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareLinks = [
    {
      label: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      bg: '#0A66C2',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M8 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 7V7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 13C12 11.8954 12.8954 11 14 11C15.1046 11 16 11.8954 16 13V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      label: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog?.title || '')}`,
      bg: '#1DA1F2',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 5C19.04 5.68 18 6 17 6.2C15.68 4.8 13.52 4.64 12 5.84C10.48 7.04 10.04 9.16 10.92 10.88C7.88 10.72 5.08 9.32 3 7C3 7 1 11 5 13C3.94 13.73 3.25 13.74 2 13.5C3 16 5.5 17 7.5 17.5C5.62 18.92 3.31 19.39 2 19C4 20.32 6.28 21 8.58 21C15.68 21 19.58 14.5 19.3 8.5C20.25 7.74 21 6 21 6C20.5 6.25 19.5 5.75 20 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      label: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      bg: '#1877F2',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 9H16V6H14C12.3431 6 11 7.34315 11 9V11H9V14H11V21H14V14H16L17 11H14V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      label: 'Copy Link',
      url: currentUrl,
      copy: true,
      bg: '#6B7280',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 8H6C4.89543 8 4 8.89543 4 10V18C4 19.1046 4.89543 20 6 20H14C15.1046 20 16 19.1046 16 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 6H18C19.1046 6 20 6.89543 20 8V16C20 17.1046 19.1046 18 18 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleBackClick = () => {
    router.push('/blogs');
  };

  const handleNavigateToBlog = (targetSlug) => {
    if (!targetSlug) return;
    router.push(`/blog/${targetSlug}`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShareClick = async (link) => {
    const hasNavigator = typeof navigator !== 'undefined';
    const hasWindow = typeof window !== 'undefined';

    if (link.copy && hasNavigator && navigator.clipboard) {
      await navigator.clipboard.writeText(currentUrl);
      return;
    }

    if (hasWindow) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <motion.main
        className="blog-details-page"
        variants={sectionVariants}
        initial={false}
        animate="visible"
        transition={sectionTransition(0)}
      >
        <div className="blog-details-container">
          <p>Loading blog post…</p>
        </div>
      </motion.main>
    );
  }

  if (!blog) {
    return (
      <motion.main
        className="blog-details-page"
        variants={sectionVariants}
        initial={false}
        animate="visible"
        transition={sectionTransition(0)}
      >
        <div className="blog-details-container">
          <button className="back-btn" onClick={handleBackClick}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Blogs
          </button>
          <div className="blog-details-empty">
            <h1>Blog post not found</h1>
            <p>{error || 'This article may have been moved or deleted.'}</p>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      className="blog-details-page"
      variants={sectionVariants}
      initial={false}
      animate="visible"
      transition={sectionTransition(0)}
    >
      <motion.div
        className="blog-details-container"
        variants={sectionVariants}
        initial={false}
        animate="visible"
        transition={sectionTransition(0.05)}
      >
        <button className="back-btn" onClick={handleBackClick}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Blogs
        </button>

        {isFallback && (
          <div className="blog-fallback-banner">
            Displaying cached content while we reconnect to the CMS.
          </div>
        )}

        <motion.div
          className="blog-details-layout"
          variants={sectionVariants}
          initial={false}
          animate="visible"
          transition={sectionTransition(0.1)}
        >
          <motion.div
            className="blog-main-column"
            variants={sectionVariants}
            initial={false}
            animate="visible"
            transition={sectionTransition(0.15)}
          >
            <article className="blog-details-content">
              <div className="blog-details-header">
                <div className="blog-details-meta">
                  <span className="blog-details-category">{blog.category}</span>
                  {blog.readTime && <span className="blog-details-read-time">{blog.readTime}</span>}
                </div>
                <RichText as="h1" className="blog-details-title" content={blog.title} />
                <div className="blog-details-author-info">
                  <div className="author-details">
                    <span className="author-name">By {blog.author}</span>
                    <span className="blog-details-date">{formatDate(blog.date)}</span>
                  </div>
                  {(blog.topics || []).length > 0 && (
                    <div className="blog-topic-pills">
                      {blog.topics.map((topic) => (
                        <span key={topic.id} className="blog-topic-pill">{topic.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {blog.image && (
                <div className="blog-details-image">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    onError={(event) => {
                      // eslint-disable-next-line no-param-reassign
                      event.currentTarget.src = '/sample/2.png';
                    }}
                  />
                </div>
              )}

              {blog.content && (
                <RichText as="div" className="blog-details-body" content={blog.content} />
              )}

              {(blog.tags || []).length > 0 && (
                <div className="blog-details-tags">
                  {(blog.tags || []).map((tag) => (
                    <span key={tag} className="blog-details-tag">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          </motion.div>

          <motion.aside
            className="blog-sidebar"
            variants={sectionVariants}
            initial={false}
            animate="visible"
            transition={sectionTransition(0.2)}
          >
            <div className="blog-widget search-widget">
              <h3 className="widget-title">Search</h3>
              <input
                type="text"
                placeholder="Search blog posts"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <div className="search-results">
                {(searchQuery ? searchResults : recentBlogs).map((item) => (
                  <button
                    key={item.slug || item.id}
                    className="search-result-item"
                    onClick={() => handleNavigateToBlog(item.slug || item.id)}
                  >
                    <span className="search-result-title">{item.title}</span>
                    <span className="search-result-date">{formatDate(item.date)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="blog-widget">
              <h3 className="widget-title">Recent Posts</h3>
              <div className="widget-list">
                {recentBlogs.map((recent) => (
                  <button
                    key={recent.slug || recent.id}
                    className="recent-blog-card"
                    onClick={() => handleNavigateToBlog(recent.slug || recent.id)}
                  >
                    <img
                      src={recent.image || '/sample/2.png'}
                      alt={recent.title}
                      onError={(event) => {
                        // eslint-disable-next-line no-param-reassign
                        event.currentTarget.src = '/sample/2.png';
                      }}
                    />
                    <div>
                      <p className="recent-blog-title">{recent.title}</p>
                      <span className="recent-blog-date">{formatDate(recent.date)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {similarBlogs.length > 0 && (
              <div className="blog-widget">
                <h3 className="widget-title">Similar Reads</h3>
                <div className="widget-list">
                  {similarBlogs.map((similar) => (
                    <button
                      key={similar.slug || similar.id}
                      className="similar-blog-card"
                      onClick={() => handleNavigateToBlog(similar.slug || similar.id)}
                    >
                      <span className="similar-blog-category">{similar.category}</span>
                      <p>{similar.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="blog-widget share-widget">
              <h3 className="widget-title">Share this article</h3>
              <div className="blog-share-links">
                {shareLinks.map((link) => (
                  <button
                    key={link.label}
                    className="share-link"
                    onClick={() => handleShareClick(link)}
                    style={{ backgroundColor: link.bg || undefined }}
                  >
                    {link.icon}
                    <span className="sr-only">Share on {link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      </motion.div>
    </motion.main>
  );
};

export default BlogDetails;
