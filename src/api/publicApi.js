import api from './publicHttpClient';

const ensureSlug = (slug) => {
  const value = typeof slug === 'string' ? slug.trim() : '';
  if (!value) {
    throw new Error('Missing portfolio slug');
  }
  return value;
};

const ensureBlogSlug = (slug) => {
  const value = typeof slug === 'string' ? slug.trim() : '';
  if (!value) {
    throw new Error('Missing blog slug');
  }
  return value;
};

const ensureBlogTopicSlug = (slug) => {
  const value = typeof slug === 'string' ? slug.trim() : '';
  if (!value) {
    throw new Error('Missing blog topic slug');
  }
  return value;
};

export const PublicServiceApi = {
  getAll: () => api.get('/services').then((res) => res.data.data),
  getMinimal: () => api.get('/services/minimal').then((res) => res.data.data),
  getOne: (identifier) => api.get(`/services/${identifier}`).then((res) => res.data.data)
};

const getBySlugSafe = (slug) => {
  try {
    return api.get(`/portfolios/slug/${ensureSlug(slug)}`).then((res) => res.data.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getMetaBySlugSafe = (slug) => {
  try {
    return api.get(`/portfolios/meta/${ensureSlug(slug)}`).then((res) => res.data.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const PublicPortfolioApi = {
  getAll: (options = {}) => {
    const params = {};
    if (options.serviceAlias) params.serviceAlias = options.serviceAlias;
    if (options.serviceId) params.serviceId = options.serviceId;
    const config = Object.keys(params).length ? { params } : {};
    return api.get('/portfolios', config).then((res) => res.data.data);
  },
  getHome: () => api.get('/portfolios/home').then((res) => res.data.data),
  getBySlug: getBySlugSafe,
  getMetaBySlug: getMetaBySlugSafe,
  getOne: (id) => api.get(`/portfolios/${id}`).then((res) => res.data.data)
};

export const PublicBlogApi = {
  getAll: (params = {}) => {
    const hasParams = Object.values(params).some((value) => value !== undefined && value !== '');
    const config = hasParams ? { params } : {};
    return api.get('/blogs', config).then((res) => res.data.data);
  },
  getOne: (id) => api.get(`/blogs/${id}`).then((res) => res.data.data),
  getBySlug: (slug) =>
    api.get(`/blogs/slug/${ensureBlogSlug(slug)}`).then((res) => res.data.data)
};

export const PublicBlogTopicApi = {
  getAll: () => api.get('/blog-topics').then((res) => res.data.data),
  getBySlug: (slug) =>
    api.get(`/blog-topics/slug/${ensureBlogTopicSlug(slug)}`).then((res) => res.data.data)
};

export const PublicTestimonialApi = {
  getAll: (pagePath) => {
    const config = pagePath ? { params: { pagePath } } : {};
    return api.get('/testimonials', config).then((res) => res.data.data);
  }
};

export const PublicContactApi = {
  submit: (payload) => api.post('/contact-queries', payload).then((res) => res.data.data)
};

export const PublicQuoteRequestApi = {
  submit: (payload) => api.post('/quote-requests', payload).then((res) => res.data.data)
};


export const PublicServiceCityApi = {
  getForService: (identifier) => api.get(`/services/${identifier}/cities`).then((res) => res.data.data),
  getCityPage: (identifier, citySlug) =>
    api.get(`/services/${identifier}/cities/${citySlug}`).then((res) => res.data.data),
};
