import { useEffect, useMemo, useState } from 'react';
import { PublicServiceApi } from '../api/publicApi';

const normalizeService = (service = {}, index = 0) => ({
  ...service,
  sortOrder: typeof service.sortOrder === 'number' ? service.sortOrder : index,
});

const sortServices = (list = []) =>
  [...list].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    return orderDiff !== 0 ? orderDiff : (a.name || '').localeCompare(b.name || '');
  });

const prepareServices = (list = []) =>
  sortServices(list.map((service, index) => normalizeService(service, index)));

const serviceCache = {
  minimal: null,
  full: null,
};

const pendingFetch = {
  minimal: null,
  full: null,
};

const fetchServices = async (preferMinimal) => {
  const cacheKey = preferMinimal ? 'minimal' : 'full';
  if (serviceCache[cacheKey]) {
    return serviceCache[cacheKey];
  }

  if (!pendingFetch[cacheKey]) {
    const fetchFn = preferMinimal ? PublicServiceApi.getMinimal : PublicServiceApi.getAll;
    pendingFetch[cacheKey] = fetchFn()
      .then((data) => prepareServices(Array.isArray(data) ? data : []))
      .catch(() => [])
      .then((list) => {
        serviceCache[cacheKey] = list;
        return list;
      })
      .finally(() => {
        pendingFetch[cacheKey] = null;
      });
  }

  return pendingFetch[cacheKey];
};

export const useServicesList = (initialServices = null, options = {}) => {
  const { preferMinimal = true, disableClientFetch = false } = options;
  const cacheKey = preferMinimal ? 'minimal' : 'full';

  const initialPrepared = useMemo(() => {
    if (Array.isArray(initialServices)) {
      return prepareServices(initialServices);
    }
    return null;
  }, [initialServices]);

  const [services, setServices] = useState(
    initialPrepared || serviceCache[cacheKey] || []
  );
  const [isLoading, setIsLoading] = useState(
    !initialPrepared && !serviceCache[cacheKey] && !disableClientFetch
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPrepared) {
      serviceCache[cacheKey] = initialPrepared;
      setServices(initialPrepared);
      setIsLoading(false);
      setError('');
      return;
    }

    if (serviceCache[cacheKey]) {
      setServices(serviceCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    if (disableClientFetch) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchServices(preferMinimal)
      .then((list) => {
        if (!isMounted) return;
        setServices(list);
        setError(list.length ? '' : '');
      })
      .catch(() => {
        if (!isMounted) return;
        setServices([]);
        setError('Unable to load services.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialPrepared, preferMinimal, disableClientFetch, cacheKey]);

  return { services, isLoading, error };
};
