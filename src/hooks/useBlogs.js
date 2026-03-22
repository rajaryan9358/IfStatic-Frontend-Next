"use client"

import { useEffect, useMemo, useState, useRef } from 'react';
import { PublicBlogApi } from '../api/publicApi';
import { fallbackBlogs, shapeBlog } from './blogHelpers';

let cachedBlogs = null;
let cachedIsFallback = false;
let inflightRequest = null;

const fetchBlogs = async (force = false) => {
  if (cachedBlogs && !force) {
    return { data: cachedBlogs, isFallback: cachedIsFallback };
  }
  if (inflightRequest) {
    return inflightRequest;
  }
  const request = PublicBlogApi.getAll()
    .then((data) => {
      if (Array.isArray(data) && data.length) {
        cachedBlogs = data.map(shapeBlog);
        cachedIsFallback = false;
      } else {
        cachedBlogs = fallbackBlogs;
        cachedIsFallback = true;
      }
      return { data: cachedBlogs, isFallback: cachedIsFallback };
    })
    .catch(() => {
      cachedBlogs = fallbackBlogs;
      cachedIsFallback = true;
      return { data: cachedBlogs, isFallback: cachedIsFallback };
    })
    .finally(() => {
      inflightRequest = null;
    });

  inflightRequest = request;
  return request;
};

export const useBlogs = ({
  topicSlug,
  search,
  initialBlogs = null,
  initialIsFallback = false,
  disableClientFetch = false
} = {}) => {
  const initialShaped = useMemo(() => {
    if (Array.isArray(initialBlogs) && initialBlogs.length) {
      return initialBlogs.map(shapeBlog);
    }
    return null;
  }, [initialBlogs]);

  const appliedInitial = useRef(false);

  if (initialShaped && !cachedBlogs && !appliedInitial.current) {
    cachedBlogs = initialShaped;
    cachedIsFallback = initialIsFallback;
  }

  const [blogs, setBlogs] = useState(cachedBlogs || initialShaped || fallbackBlogs);
  const [isLoading, setIsLoading] = useState(!(cachedBlogs || initialShaped) && !disableClientFetch);
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(
    cachedIsFallback || initialIsFallback || (!cachedBlogs && !initialShaped)
  );

  useEffect(() => {
    let isMounted = true;

    if (initialShaped && !appliedInitial.current) {
      appliedInitial.current = true;
      cachedBlogs = initialShaped;
      cachedIsFallback = initialIsFallback;
      setBlogs(initialShaped);
      setIsFallback(initialIsFallback);
    }

    if (disableClientFetch) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const hasCache = Boolean(cachedBlogs);
    const shouldForce = cachedIsFallback;

    if (hasCache && !shouldForce) {
      setBlogs(cachedBlogs);
      setIsFallback(cachedIsFallback);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setError('');
    setIsLoading(!hasCache);

    fetchBlogs(shouldForce)
      .then(({ data, isFallback: fallbackFlag }) => {
        if (isMounted) {
          setBlogs(data);
          setIsFallback(fallbackFlag);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load latest blog posts. Showing defaults.');
          setBlogs(fallbackBlogs);
          setIsFallback(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [disableClientFetch, initialShaped, initialIsFallback]);

  const normalizedTopic = typeof topicSlug === 'string' ? topicSlug.trim().toLowerCase() : '';
  const normalizedSearch = typeof search === 'string' ? search.trim().toLowerCase() : '';

  const filteredBlogs = useMemo(() => {
    let next = blogs;
    if (normalizedTopic) {
      next = next.filter((blog) => (blog.topics || []).some((topic) => topic.slug === normalizedTopic));
    }
    if (normalizedSearch) {
      next = next.filter((blog) => {
        const haystack = `${blog.title} ${blog.excerpt} ${blog.author} ${blog.tags.join(' ')}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }
    return next;
  }, [blogs, normalizedTopic, normalizedSearch]);

  return {
    blogs: filteredBlogs,
    allBlogs: blogs,
    isLoading,
    error,
    isFallback
  };
};

export const getCachedBlogById = (id) => {
  if (!id || !cachedBlogs) return null;
  return cachedBlogs.find((blog) => String(blog.id) === String(id)) || null;
};

export const getCachedBlogBySlug = (slug) => {
  if (!slug || !cachedBlogs) return null;
  const normalized = slug.trim().toLowerCase();
  return cachedBlogs.find((blog) => blog.slug === normalized) || null;
};

export const primeBlogCache = (items) => {
  if (!Array.isArray(items) || !items.length) return;
  cachedBlogs = items.map(shapeBlog);
  cachedIsFallback = false;
};

export const isBlogCacheFallback = () => cachedIsFallback;
