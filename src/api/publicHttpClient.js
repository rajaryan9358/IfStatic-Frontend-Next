import axios from 'axios';

const getBackendBase = () => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    'http://localhost:5003';
  return String(raw).replace(/\/+$/, '');
};

const baseURL =
  typeof window === 'undefined'
    ? `${getBackendBase()}/api/public`
    : '/api/backend/public';

const publicApi = axios.create({
  baseURL,
});

export default publicApi;

publicApi.interceptors.request.use((config) => {
  const url = config.url || '';
  if (/^\/portfolios\/(meta|slug)\/\s*$/i.test(url)) {
    return Promise.reject(new Error('Missing portfolio slug'));
  }
  return config;
});
