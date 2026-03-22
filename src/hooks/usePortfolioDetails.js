import { useEffect, useState } from 'react';
import { PublicPortfolioApi } from '../api/publicApi';
import { findFallbackBySlug, normalizeSlug, shapePortfolio } from './portfolioHelpers';
import { getCachedPortfolioBySlug } from './usePortfolios';

const STORAGE_KEY = 'portfolio-cache';

const readStoredPortfolio = (slug) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map?.[slug] || null;
  } catch (error) {
    console.warn('Unable to read stored portfolio', error);
    return null;
  }
};

const persistPortfolio = (slug, value) => {
  if (typeof window === 'undefined' || !slug || !value) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[slug] = value;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn('Unable to persist portfolio', error);
  }
};

const shapeWithMeta = (item) => {
  if (!item) return null;
  const shaped = shapePortfolio(item);
  return {
    ...shaped,
    metaTitle: item?.metaTitle ?? shaped.metaTitle ?? '',
    metaDescription: item?.metaDescription ?? shaped.metaDescription ?? '',
    metaSchema: item?.metaSchema ?? shaped.metaSchema ?? ''
  };
};

const mergeMeta = (base = null, meta = {}) => {
  if (!meta || typeof meta !== 'object') return base;
  const next = { ...(base || {}), metaTitle: meta.metaTitle ?? base?.metaTitle ?? '' };
  next.metaDescription = meta.metaDescription ?? base?.metaDescription ?? '';
  next.metaSchema = meta.metaSchema ?? base?.metaSchema ?? '';
  if (!next.heroTitle && meta.fallbackTitle) {
    next.heroTitle = meta.fallbackTitle;
  }
  return next;
};

export const usePortfolioDetails = (slug) => {
  const normalizedSlug = normalizeSlug(slug);
  const cached = normalizedSlug ? getCachedPortfolioBySlug(normalizedSlug) : null;
  const stored = normalizedSlug ? readStoredPortfolio(normalizedSlug) : null;
  const fallback = normalizedSlug && !cached && !stored ? findFallbackBySlug(normalizedSlug) : null;
  const initial = cached || stored || (fallback ? shapeWithMeta(fallback) : null);

  const [portfolio, setPortfolio] = useState(initial);
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(Boolean(fallback && !cached && !stored));

  useEffect(() => {
    if (!normalizedSlug) {
      setPortfolio(null);
      setIsFallback(false);
      setError('Missing project identifier.');
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    const cachedPortfolio = getCachedPortfolioBySlug(normalizedSlug);
    const storedPortfolio = readStoredPortfolio(normalizedSlug);
    const fallbackPortfolio = findFallbackBySlug(normalizedSlug);

    if (cachedPortfolio || storedPortfolio) {
      const base = cachedPortfolio || storedPortfolio;
      setPortfolio(base);
      setIsFallback(false);
      setError('');
      setIsLoading(false);
    } else if (fallbackPortfolio) {
      const shapedFallback = shapeWithMeta(fallbackPortfolio);
      setPortfolio(shapedFallback);
      setIsFallback(true);
      setError('');
      setIsLoading(false);
    } else {
      setPortfolio(null);
      setIsFallback(false);
      setError('');
      setIsLoading(true);
    }

    PublicPortfolioApi.getMetaBySlug(normalizedSlug)
      .then((meta) => {
        if (!isMounted) return;
        setPortfolio((prev) => {
          const next = shapeWithMeta(mergeMeta(prev || { slug: normalizedSlug }, meta));
          persistPortfolio(normalizedSlug, next);
          return next;
        });
      })
      .catch(() => {
        /* ignore meta fetch errors */
      });

    PublicPortfolioApi.getBySlug(normalizedSlug)
      .then((data) => {
        if (!isMounted) return;
        const shaped = shapeWithMeta(data);
        setPortfolio(shaped);
        setIsFallback(false);
        setError('');
        setIsLoading(false);
        persistPortfolio(normalizedSlug, shaped);
      })
      .catch((apiError) => {
        if (!isMounted) return;
        if (cachedPortfolio || storedPortfolio) {
          const base = shapeWithMeta(cachedPortfolio || storedPortfolio);
          setPortfolio(base);
          setIsFallback(false);
          setError('');
          persistPortfolio(normalizedSlug, base);
        } else if (fallbackPortfolio) {
          const shaped = shapeWithMeta(mergeMeta(fallbackPortfolio));
          setPortfolio(shaped);
          setIsFallback(true);
          setError('');
        } else {
          setPortfolio(null);
          setIsFallback(false);
          setError(
            apiError?.response?.data?.message || apiError.message || 'Project not found.'
          );
        }
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedSlug]);

  return { portfolio, isLoading, error, isFallback };
};
