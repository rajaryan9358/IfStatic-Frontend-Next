"use client"

import { useEffect, useState } from 'react';
import { PublicBlogApi } from '../api/publicApi';
import { fallbackBlogs, shapeBlog } from './blogHelpers';
import { getCachedBlogById, getCachedBlogBySlug, primeBlogCache, isBlogCacheFallback } from './useBlogs';

const findFallbackById = (id) => {
  if (!id) return null;
  return fallbackBlogs.find((item) => String(item.id) === String(id)) || null;
};

const findFallbackBySlug = (slug) => {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return fallbackBlogs.find((item) => item.slug === normalized) || null;
};

export const useBlogDetails = ({ blogId, slug, initialBlog = null, disableClientFetch = false } = {}) => {
  const normalizedId = blogId ? String(blogId) : '';
  const normalizedSlug = slug ? slug.trim().toLowerCase() : '';

  const useSlugEndpoint = Boolean(normalizedSlug) && !normalizedId;

  const resolveInitialBlog = () => {
    if (initialBlog) return shapeBlog(initialBlog);
    if (normalizedSlug) {
      const viaSlug = getCachedBlogBySlug(normalizedSlug) || findFallbackBySlug(normalizedSlug);
      if (viaSlug) return viaSlug;
    }
    if (normalizedId) {
      return getCachedBlogById(normalizedId) || findFallbackById(normalizedId);
    }
    return null;
  };

  const initialResolved = resolveInitialBlog();
  if (initialBlog && initialResolved) {
    primeBlogCache([initialResolved]);
  }

  const [blog, setBlog] = useState(initialResolved);
  const [isLoading, setIsLoading] = useState(!initialResolved && !disableClientFetch);
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(Boolean(initialResolved && !getCachedBlogById(normalizedId) && !getCachedBlogBySlug(normalizedSlug)));

  useEffect(() => {
    if (!normalizedId && !normalizedSlug) {
      setBlog(null);
      setIsLoading(false);
      setError('Missing blog identifier.');
      setIsFallback(false);
      return;
    }

    let isMounted = true;
    setError('');

    const cachedBlog = useSlugEndpoint
      ? getCachedBlogBySlug(normalizedSlug)
      : getCachedBlogById(normalizedId);
    const cacheIsFallback = isBlogCacheFallback();

    if (cachedBlog && !cacheIsFallback) {
      setBlog(cachedBlog);
      setIsFallback(false);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (cachedBlog && cacheIsFallback) {
      setBlog(cachedBlog);
      setIsFallback(true);
    }

    const fallbackBlog = useSlugEndpoint
      ? findFallbackBySlug(normalizedSlug) || findFallbackById(normalizedId)
      : findFallbackById(normalizedId);
    if (!cachedBlog && fallbackBlog) {
      setBlog(fallbackBlog);
      setIsFallback(true);
    } else if (!cachedBlog && !fallbackBlog) {
      setBlog(null);
      setIsFallback(false);
    }

    if (disableClientFetch) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);

    const fetchPromise = useSlugEndpoint
      ? PublicBlogApi.getBySlug(normalizedSlug)
      : PublicBlogApi.getOne(normalizedId || normalizedSlug);

    fetchPromise
      .then((data) => {
        if (!isMounted) return;
        const shaped = shapeBlog(data);
        setBlog(shaped);
        setIsFallback(false);
        primeBlogCache([shaped]);
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(apiError?.response?.data?.message || apiError.message || 'Blog not found.');
        if (!fallbackBlog) {
          const fallback = useSlugEndpoint
            ? findFallbackBySlug(normalizedSlug) || findFallbackById(normalizedId)
            : findFallbackById(normalizedId);
          if (fallback) {
            setBlog(fallback);
            setIsFallback(true);
          }
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
  }, [normalizedId, normalizedSlug, useSlugEndpoint, disableClientFetch]);

  return { blog, isLoading, error, isFallback };
};
