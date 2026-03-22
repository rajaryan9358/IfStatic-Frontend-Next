const assetBase = (process.env.REACT_APP_ASSET_BASE_URL || '').replace(/\/$/, '') ||
  (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

const resolveMediaUrl = (value) => {
  if (!value) return '/sample/2.png';
  const trimmed = value.trim();
  if (!trimmed) return '/sample/2.png';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const prefixed = trimmed.includes('/') ? trimmed : `/uploads/${trimmed}`;
  const normalized = prefixed.startsWith('/') ? prefixed : `/${prefixed}`;
  return assetBase ? `${assetBase}${normalized}` : normalized;
};

export const normalizeAlias = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toLowerCase();
  return trimmed.replace(/[^a-z0-9-\/]/g, '').replace(/\/+/g, '/');
};

export const normalizeSlug = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const shapeList = (list, mapper) => (Array.isArray(list) ? list.map(mapper) : []);

const buildSortOrder = (value, fallback) => (typeof value === 'number' ? value : fallback);

const shapeFeature = (feature = {}) => ({
  title: feature.title?.trim() || '',
  description: feature.description?.trim() || ''
});

const shapeTech = (tech = {}) => ({
  name: tech.name?.trim() || '',
  icon: resolveMediaUrl(tech.icon)
});

const shapeCtaButton = (button = {}) => ({
  label: button.label?.trim() || '',
  image: resolveMediaUrl(button.image),
  url: button.url?.trim() || ''
});

export const shapePortfolio = (item = {}, index = 0) => ({
  id: item.id,
  serviceId: item.serviceId ?? null,
  serviceAlias: normalizeAlias(item.serviceAlias) || null,
  serviceName: item.serviceName || null,
  slug: normalizeSlug(item.slug) || '',
  name: item.name || '',
  description: item.description || '',
  sortOrder: buildSortOrder(item.sortOrder, index),
  company: item.company || '',
  image: resolveMediaUrl(item.image),
  heroCategory: item.heroCategory || '',
  heroTitle: item.heroTitle || '',
  heroSubtitle: item.heroSubtitle || '',
  heroTagline: item.heroTagline || '',
  summary: item.summary || '',
  websiteUrl: item.websiteUrl || '',
  tags: Array.isArray(item.tags) ? item.tags : [],
  features: shapeList(item.features, shapeFeature),
  techStack: shapeList(item.techStack, shapeTech),
  ctaButtons: shapeList(item.ctaButtons, shapeCtaButton),
  gallery: Array.isArray(item.gallery) ? item.gallery.map(resolveMediaUrl) : [],
  metaTitle: item.metaTitle ?? item.meta_title ?? '',
  metaDescription: item.metaDescription ?? item.meta_description ?? '',
  metaSchema: item.metaSchema ?? item.meta_schema ?? '',
  showDownloadSection: item.showDownloadSection !== false,
  downloadTitle: item.downloadTitle || item.heroTagline || item.name || '',
  downloadDescription: item.downloadDescription || item.summary || '',
  ctaTitle: item.ctaTitle || ''
});

export const sortPortfolios = (list = []) =>
  [...list].sort((a, b) => {
    const diff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (diff !== 0) {
      return diff;
    }
    return (a.name || '').localeCompare(b.name || '');
  });

export const fallbackPortfolios = []
;
export const findFallbackBySlug = (slug) => {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  return fallbackPortfolios.find((item) => item.slug === normalized) || null;
};
