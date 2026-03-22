import { useEffect, useState } from 'react';
const normalizeTestimonial = (testimonial = {}, index = 0) => ({
  ...testimonial,
  sortOrder: typeof testimonial.sortOrder === 'number' ? testimonial.sortOrder : index
});

const sortTestimonials = (list = []) =>
  [...list].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    return (a.id ?? 0) - (b.id ?? 0);
  });

const prepareTestimonials = (list = []) => sortTestimonials(list.map((testimonial, index) => normalizeTestimonial(testimonial, index)));
const fallbackTestimonials = [];

const cache = new Map();

const normalizePath = (inputPath) => {
  if (!inputPath) {
    return '';
  }
  let path = inputPath.trim();
  if (!path) {
    return '';
  }
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  path = path.replace(/\/+/, '/');
  path = path.replace(/\/+$/, '');
  if (!path) {
    return '/';
  }
  return path === '/' ? '/' : path.toLowerCase();
};

const buildKey = (pagePath) => {
  const normalized = normalizePath(pagePath);
  return normalized || 'all';
};

export const useTestimonials = (pagePath, initialTestimonials = null, initialIsFallback = false) => {
  const normalizedPath = normalizePath(pagePath);
  const cacheKey = buildKey(normalizedPath);
  const hasInitial = Array.isArray(initialTestimonials) && initialTestimonials.length;
  const initialValue = hasInitial ? prepareTestimonials(initialTestimonials) : cache.get(cacheKey) || fallbackTestimonials;
  const hasCache = cache.has(cacheKey) || hasInitial;
  const [testimonials, setTestimonials] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(initialIsFallback || !hasCache);

  useEffect(() => {
    if (hasInitial) {
      cache.set(cacheKey, initialValue);
      setIsLoading(false);
      setIsFallback(initialIsFallback);
      return undefined;
    }

    if (cache.has(cacheKey)) {
      setTestimonials(cache.get(cacheKey));
      setIsFallback(false);
      setIsLoading(false);
      return undefined;
    }

    cache.set(cacheKey, fallbackTestimonials);
    setTestimonials(fallbackTestimonials);
    setIsFallback(true);
    setIsLoading(false);
    setError('');
    return undefined;
  }, [cacheKey, hasInitial, initialIsFallback, initialValue]);

  return { testimonials, isLoading, error, isFallback };
};
