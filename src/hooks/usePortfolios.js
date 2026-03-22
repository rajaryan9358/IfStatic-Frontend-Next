import { useEffect, useMemo, useRef, useState } from 'react';
import {
  fallbackPortfolios,
  normalizeAlias,
  normalizeSlug,
  shapePortfolio,
  sortPortfolios
} from './portfolioHelpers';

const fallbackByScope = {
  all: fallbackPortfolios,
  home: fallbackPortfolios.filter((item) => item.showInHome)
};

// keep meta fields while shaping
const shapeWithMeta = (item) => {
  const shaped = shapePortfolio(item);
  return {
    ...shaped,
    metaTitle: item?.metaTitle ?? shaped.metaTitle ?? '',
    metaDescription: item?.metaDescription ?? shaped.metaDescription ?? '',
    metaSchema: item?.metaSchema ?? shaped.metaSchema ?? ''
  };
};

const cache = { all: null, home: null };
const inflight = { all: null, home: null };
const isFallbackCache = { all: false, home: false };

const fetchPortfolios = async (scope = 'all') => {
  if (cache[scope]) {
    return { data: cache[scope], isFallback: isFallbackCache[scope] };
  }
  if (inflight[scope]) {
    return inflight[scope];
  }

  const apiCall = scope === 'home' ? PublicPortfolioApi.getHome() : PublicPortfolioApi.getAll();

  inflight[scope] = apiCall
    .then((data) => {
      const shaped =
        Array.isArray(data) && data.length
          ? sortPortfolios(data.map((item) => shapeWithMeta(item)))
          : fallbackByScope[scope].map((item) => shapeWithMeta(item));
      cache[scope] = shaped; // do not re-filter home payload; API already filters
      isFallbackCache[scope] = !Array.isArray(data) || !data.length;
      return { data: cache[scope], isFallback: isFallbackCache[scope] };
    })
    .catch(() => {
      cache[scope] = fallbackByScope[scope].map((item) => shapeWithMeta(item));
      isFallbackCache[scope] = true;
      return { data: cache[scope], isFallback: true };
    })
    .finally(() => {
      inflight[scope] = null;
    });

  return inflight[scope];
};

export const usePortfolios = (serviceAlias, homeOnly = false, fetchAllWhenNoAlias = false, initialPortfolios = null, initialIsFallback = false) => {
  const normalizedAlias = homeOnly ? null : normalizeAlias(serviceAlias);
  const scope = homeOnly ? 'home' : normalizedAlias ? 'all' : (fetchAllWhenNoAlias ? 'all' : 'home');

  const initialPrepared = Array.isArray(initialPortfolios) && initialPortfolios.length
    ? sortPortfolios(initialPortfolios.map((item) => shapeWithMeta(item)))
    : null;

  if (initialPrepared && !cache[scope]) {
    cache[scope] = initialPrepared;
    isFallbackCache[scope] = initialIsFallback;
  }

  const [portfolios, setPortfolios] = useState(cache[scope] || initialPrepared || fallbackByScope[scope]);
  const [isLoading, setIsLoading] = useState(!cache[scope] && !initialPrepared);
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(isFallbackCache[scope] || initialIsFallback || false);

  const hasAppliedInitial = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (initialPrepared && !hasAppliedInitial.current) {
      hasAppliedInitial.current = true;
      setPortfolios(initialPrepared);
      setIsFallback(initialIsFallback);
      setIsLoading(false);
      cache[scope] = initialPrepared;
      isFallbackCache[scope] = initialIsFallback;
      return () => {
        isMounted = false;
      };
    }

    if (cache[scope]) {
      setPortfolios(cache[scope]);
      setIsFallback(isFallbackCache[scope]);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    fetchPortfolios(scope)
      .then(({ data, isFallback: fallbackFlag }) => {
        if (isMounted) {
          setPortfolios(data);
          setIsFallback(fallbackFlag);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load latest portfolio projects. Showing defaults.');
          setPortfolios(fallbackByScope[scope]);
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
  }, [scope, initialPrepared, initialIsFallback]);

  const filteredPortfolios = useMemo(() => {
    if (!normalizedAlias) {
      return portfolios;
    }
    return portfolios.filter((item) => item.serviceAlias === normalizedAlias);
  }, [normalizedAlias, portfolios]);

  return {
    portfolios: filteredPortfolios,
    isLoading,
    error,
    isFallback
  };
};

export const getCachedPortfolios = () => cache.all;

export const getCachedPortfolioBySlug = (slug) => {
  const normalized = normalizeSlug(slug);
  if (!normalized || !cache.all) {
    return null;
  }
  return cache.all.find((item) => item.slug === normalized) || null;
};
