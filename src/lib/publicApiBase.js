const trimTrailingSlashes = (value) => String(value || '').trim().replace(/\/+$/g, '');

export const normalizePublicApiBase = (value) => {
  const normalized = trimTrailingSlashes(value);

  if (!normalized) return '';
  if (/\/api\/backend\/public$/i.test(normalized)) return normalized;
  if (/\/api\/public$/i.test(normalized)) return normalized;
  if (/\/api\/backend$/i.test(normalized)) return `${normalized}/public`;
  if (/\/api$/i.test(normalized)) return `${normalized}/public`;

  return `${normalized}/api/public`;
};

export const getConfiguredPublicApiBase = () =>
  normalizePublicApiBase(
    process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      ''
  );

export const getPublicApiBaseCandidates = () => {
  const configured = getConfiguredPublicApiBase();

  return [configured, '/api/public', '/api/backend/public'].filter(
    (value, index, all) => Boolean(value) && all.indexOf(value) === index
  );
};

export const normalizePublicApiPath = (path = '') => `/${String(path || '').replace(/^\/+/, '')}`;

export const resolvePublicApiUrl = (base, path = '') => {
  const normalizedBase = trimTrailingSlashes(base);
  const normalizedPath = normalizePublicApiPath(path);

  if (!normalizedBase) return normalizedPath;

  return `${normalizedBase}${normalizedPath}`;
};