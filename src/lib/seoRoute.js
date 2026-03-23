export const normalizePathPart = (value) =>
  decodeURIComponent(String(value || ''))
    .trim()
    .toLowerCase()
    .replace(/^\/+/g, '')
    .replace(/\/+$/g, '')
    .replace(/\s+/g, '-');

export const mapPathToSeoQuery = (pathname) => {
  const raw = String(pathname || '/');
  const pathOnly = (() => {
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return new URL(raw).pathname;
      }
    } catch {}
    return raw;
  })();

  const path = pathOnly.split('?')[0];
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) return { pageType: 'home', subType: '' };

  if (parts[0] === 'about') return { pageType: 'about', subType: '' };
  if (parts[0] === 'contact') return { pageType: 'contact', subType: '' };
  if (parts[0] === 'privacy-policy') return { pageType: 'privacy', subType: '' };
  if (parts[0] === 'terms-and-conditions') return { pageType: 'terms', subType: '' };

  if (parts[0] === 'services') {
    const alias = parts[1] ? normalizePathPart(parts[1]) : '';
    const third = parts[2] ? normalizePathPart(parts[2]) : '';

    if (alias && third && third !== 'cities') {
      return {
        pageType: 'service_city',
        subType: `${alias}/${third}`,
      };
    }

    return {
      pageType: 'services',
      subType: alias,
    };
  }

  if (parts[0] === 'portfolio') {
    return {
      pageType: 'portfolios',
      subType: parts[1] ? normalizePathPart(parts[1]) : '',
    };
  }

  if (parts[0] === 'blogs') {
    const normalized = parts[1] ? normalizePathPart(parts[1]) : '';
    return { pageType: 'blogs', subType: normalized === 'all' ? '' : normalized };
  }

  if (parts[0] === 'blog' && parts[1]) {
    return { pageType: 'blogdetail', subType: normalizePathPart(parts[1]) };
  }

  if (parts[0] === 'project' && parts[1]) {
    return { pageType: 'projects', subType: normalizePathPart(parts[1]) };
  }

  return { pageType: 'home', subType: '' };
};