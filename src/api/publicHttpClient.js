import axios from 'axios';
import { getPublicApiBaseCandidates, normalizePublicApiBase } from '@/lib/publicApiBase';

const RETRY_STATE_KEY = '__ifstaticPublicApiRetryState';

const normalizeBackendBase = (value) =>
  normalizePublicApiBase(
    String(value || '')
      .replace(/\/api\/backend\/public$/i, '')
      .replace(/\/api\/backend$/i, '')
      .replace(/\/api\/public$/i, '')
      .replace(/\/api$/i, '')
  );

const getBackendBase = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:5003';
  return normalizeBackendBase(raw);
};

const baseURL =
  typeof window === 'undefined'
    ? getBackendBase()
    : getPublicApiBaseCandidates()[0] || '/api/public';

const publicApi = axios.create({
  baseURL,
});

export default publicApi;

publicApi.interceptors.request.use((config) => {
  const url = config.url || '';
  if (/^\/portfolios\/(meta|slug)\/\s*$/i.test(url)) {
    return Promise.reject(new Error('Missing portfolio slug'));
  }

  if (typeof window !== 'undefined' && !/^https?:\/\//i.test(url)) {
    const retryState = config[RETRY_STATE_KEY] || {
      candidates: getPublicApiBaseCandidates(),
      index: 0,
    };
    const nextBase = retryState.candidates[retryState.index] || retryState.candidates[0];

    if (nextBase) {
      config.baseURL = nextBase;
    }

    config[RETRY_STATE_KEY] = retryState;
  }

  return config;
});

publicApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const config = error?.config;
    const url = config?.url || '';

    if (!config || /^https?:\/\//i.test(url)) {
      return Promise.reject(error);
    }

    const retryState = config[RETRY_STATE_KEY] || {
      candidates: getPublicApiBaseCandidates(),
      index: 0,
    };
    const shouldRetry =
      (!error.response || error.response.status === 404) &&
      retryState.index < retryState.candidates.length - 1;

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    return publicApi.request({
      ...config,
      [RETRY_STATE_KEY]: {
        ...retryState,
        index: retryState.index + 1,
      },
    });
  }
);
