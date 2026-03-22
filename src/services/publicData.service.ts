import {
  PublicBlogApi,
  PublicBlogTopicApi,
  PublicPortfolioApi,
  PublicServiceApi,
  PublicServiceCityApi,
  PublicTestimonialApi,
} from '@/api/publicApi';

type Service = {
  id?: string | number;
  alias?: string;
  name?: string;
  [key: string]: unknown;
};

type Portfolio = {
  id?: string | number;
  slug?: string;
  showInHome?: boolean;
  serviceId?: unknown;
  serviceAlias?: string;
  [key: string]: unknown;
};

type Blog = {
  id?: string | number;
  slug?: string;
  title?: string;
  [key: string]: unknown;
};

type BlogTopic = Record<string, unknown>;

type Testimonial = Record<string, unknown>;

const fallbackPortfolios: Portfolio[] = [];
const fallbackTestimonials: Testimonial[] = [];
const fallbackBlogs: Blog[] = [];
const fallbackTopics: BlogTopic[] = [];

const serviceAliasMap: Record<string, string> = {
  // Legacy → canonical mappings
  'web-development': 'website-development',
  'front-end-development': 'website-development',
  'ui-ux-design': 'ui-ux-designing',
  'wordpress-development': 'wordpress-designing',

  // Synonyms for app/software
  'software-development': 'software-development',
  'mobile-app-development': 'app-development',
  'mobile-development': 'app-development',
  'application-development': 'app-development',
  'app-development': 'app-development',

  // Canonical passthrough
  'website-development': 'website-development',
  'ui-ux-designing': 'ui-ux-designing',
  'wordpress-designing': 'wordpress-designing',
};

export function resolveServiceAlias(alias: string) {
  if (!alias) return '';
  const normalized = String(alias || '').trim().toLowerCase();
  return serviceAliasMap[normalized] || normalized;
}

const safeFetchArray = async <T>(fn: () => Promise<unknown>, fallback: T[]): Promise<T[]> => {
  try {
    const data = await fn();
    return Array.isArray(data) && data.length ? (data as T[]) : fallback;
  } catch {
    return fallback;
  }
};

export async function fetchServicesServer(): Promise<Service[]> {
  try {
    const data = await PublicServiceApi.getAll();
    return Array.isArray(data) ? (data as Service[]) : [];
  } catch {
    return [];
  }
}

export async function fetchServicesMinimalServer(): Promise<Service[]> {
  try {
    const data = await PublicServiceApi.getMinimal();
    return Array.isArray(data) ? (data as Service[]) : [];
  } catch {
    return [];
  }
}

export async function fetchPortfoliosServer(scope: 'all' | 'home' = 'all'): Promise<{ data: Portfolio[]; isFallback: boolean }> {
  if (scope === 'home') {
    const fallback = fallbackPortfolios.filter((item) => Boolean(item.showInHome));
    const data = await safeFetchArray<Portfolio>(() => PublicPortfolioApi.getHome(), fallback);
    return { data, isFallback: !data.length };
  }

  const data = await safeFetchArray<Portfolio>(() => PublicPortfolioApi.getAll(), fallbackPortfolios);
  return { data, isFallback: !data.length };
}

export async function fetchPortfolioBySlugServer(slug: string): Promise<Portfolio | null> {
  try {
    const data = await PublicPortfolioApi.getBySlug(slug);
    return data ? (data as Portfolio) : null;
  } catch {
    const normalized = (slug || '').trim().toLowerCase();
    return fallbackPortfolios.find((p) => (p.slug || '').toLowerCase() === normalized) || null;
  }
}

export async function fetchPortfolioMetaBySlugServer(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const data = await PublicPortfolioApi.getMetaBySlug(slug);
    return (data as Record<string, unknown>) || null;
  } catch {
    return null;
  }
}

export async function fetchBlogsServer(params: Record<string, unknown> = {}): Promise<{ data: Blog[]; isFallback: boolean }> {
  try {
    const data = await PublicBlogApi.getAll(params as Record<string, unknown>);
    if (Array.isArray(data) && data.length) return { data: data as Blog[], isFallback: false };
  } catch {
    // ignore
  }
  return { data: fallbackBlogs, isFallback: true };
}

export async function fetchBlogBySlugServer(slugOrId: string): Promise<Blog | null> {
  const raw = slugOrId || '';
  const trimmed = String(raw).trim();
  const normalized = trimmed.toLowerCase();
  const isNumeric = normalized && /^\d+$/.test(normalized);

  if (isNumeric) {
    try {
      const byId = await PublicBlogApi.getOne(normalized);
      if (byId) return byId as Blog;
    } catch {
      // ignore
    }
  }

  try {
    const bySlug = await PublicBlogApi.getBySlug(trimmed);
    if (bySlug) return bySlug as Blog;
  } catch {
    // ignore
  }

  return (
    fallbackBlogs.find((b) => (b.slug || '').toLowerCase() === normalized) ||
    (isNumeric ? fallbackBlogs.find((b) => String(b.id) === normalized) : null) ||
    null
  );
}

export async function fetchBlogTopicsServer(): Promise<BlogTopic[]> {
  return safeFetchArray<BlogTopic>(() => PublicBlogTopicApi.getAll(), fallbackTopics);
}

export async function fetchBlogTopicBySlugServer(slug: string): Promise<BlogTopic | null> {
  const raw = slug || '';
  const trimmed = String(raw).trim();
  const normalized = trimmed.toLowerCase();
  if (!normalized) return null;

  try {
    const data = await PublicBlogTopicApi.getBySlug(trimmed);
    return (data as BlogTopic) || null;
  } catch {
    return null;
  }
}

export async function fetchTestimonialsServer(pagePath: string = '/'): Promise<{ data: Testimonial[]; isFallback: boolean }> {
  const normalized = typeof pagePath === 'string' && pagePath.trim() ? pagePath : '/';
  const data = await safeFetchArray<Testimonial>(
    () => PublicTestimonialApi.getAll(normalized === '/' ? undefined : normalized),
    fallbackTestimonials
  );
  return { data, isFallback: !data.length };
}

export async function fetchServiceByAliasServer(alias: string): Promise<Service | null> {
  if (!alias) return null;

  const normalized = String(alias || '').trim().toLowerCase();
  const canonicalAlias = resolveServiceAlias(alias);

  const withAlias = (service: Service | null) => {
    if (!service) return null;
    return { ...service, alias: service.alias || canonicalAlias };
  };

  const tryGetOne = async (key: string): Promise<Service | null> => {
    if (!key) return null;
    try {
      const data = await PublicServiceApi.getOne(key);
      return data ? (data as Service) : null;
    } catch {
      return null;
    }
  };

  const direct = await tryGetOne(normalized);
  if (direct) return withAlias(direct);

  if (canonicalAlias && canonicalAlias !== normalized) {
    const mapped = await tryGetOne(canonicalAlias);
    if (mapped) return withAlias(mapped);
  }

  try {
    const list = await PublicServiceApi.getAll();
    if (Array.isArray(list) && list.length) {
      const found =
        (list as Service[]).find((s) => (s.alias || '').toLowerCase() === normalized) ||
        (canonicalAlias ? (list as Service[]).find((s) => (s.alias || '').toLowerCase() === canonicalAlias) : null);
      if (found) return withAlias(found);
    }
  } catch {
    // ignore
  }

  return null;
}

export async function fetchPortfoliosFilteredServer({
  serviceAlias,
  serviceId,
}: {
  serviceAlias?: string;
  serviceId?: unknown;
} = {}): Promise<{ data: Portfolio[]; isFallback: boolean }> {
  const params: Record<string, unknown> = {};
  if (serviceAlias) params.serviceAlias = serviceAlias;
  if (serviceId) params.serviceId = serviceId;

  const hasParams = Object.keys(params).length > 0;

  const fallback = hasParams
    ? fallbackPortfolios.filter(
        (p) =>
          (serviceId !== undefined && p.serviceId === serviceId) ||
          (serviceAlias && (p.serviceAlias || '').toLowerCase() === String(serviceAlias).toLowerCase())
      )
    : fallbackPortfolios;

  try {
    const data = await PublicPortfolioApi.getAll(hasParams ? { serviceAlias, serviceId } : {});
    const list = Array.isArray(data) && data.length ? (data as Portfolio[]) : fallback;
    return { data: list, isFallback: !Array.isArray(data) || !data.length };
  } catch {
    return { data: fallback, isFallback: true };
  }
}


type ServiceCity = {
  id?: string | number;
  serviceId?: string | number;
  cityName?: string;
  title?: string;
  slug?: string;
  sortOrder?: number;
  isInternational?: boolean;
  [key: string]: unknown;
};

export async function fetchServiceCitiesServer(identifier: string): Promise<ServiceCity[]> {
  const key = typeof identifier === 'string' ? identifier.trim() : '';
  if (!key) return [];
  try {
    const data = await PublicServiceCityApi.getForService(key);
    return Array.isArray(data) ? (data as ServiceCity[]) : [];
  } catch {
    return [];
  }
}

export async function fetchServiceCityPageServer(identifier: string, citySlug: string): Promise<{ service: Service; city: Record<string, unknown> } | null> {
  const key = typeof identifier === 'string' ? identifier.trim() : '';
  const slug = typeof citySlug === 'string' ? citySlug.trim() : '';
  if (!key || !slug) return null;

  try {
    const data = await PublicServiceCityApi.getCityPage(key, slug);
    if (!data || typeof data !== 'object') return null;
    const service = (data as any).service as Service | undefined;
    const city = (data as any).city as Record<string, unknown> | undefined;
    if (!service || !city) return null;
    return { service, city };
  } catch {
    return null;
  }
}
