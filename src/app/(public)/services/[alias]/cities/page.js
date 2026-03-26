import ServiceCitiesPage from '@/views/ServiceCitiesPage';
import { fetchServiceByAliasServer, fetchServiceCitiesServer, resolveServiceAlias } from '@/services/publicData.service';
import '@/views/ServiceCitiesPage.css';

const stripHtmlTags = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const normalizeCityField = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';

  const lower = normalized.toLowerCase();
  if (['null', 'undefined', 'n/a', 'na', 'none'].includes(lower)) {
    return '';
  }

  return normalized;
};

const splitCities = (cities) => {
  const domestic = [];
  const international = [];

  for (const city of Array.isArray(cities) ? cities : []) {
    const isInternational = Boolean(city?.isInternational);
    if (isInternational) international.push(city);
    else domestic.push(city);
  }

  return { domestic, international };
};

const getAlias = (resolvedParams) =>
  resolvedParams?.alias ? String(resolvedParams.alias) : '';

export default async function ServiceCitiesRoute({ params }) {
  const resolvedParams = (await params) || {};
  const alias = getAlias(resolvedParams);
  const canonicalAlias = resolveServiceAlias(alias);

  const service = await fetchServiceByAliasServer(alias);
  const serviceAlias = service?.alias || canonicalAlias;

  const serviceNameRaw =
    service?.name || service?.title || service?.heroTitle || serviceAlias || 'service';
  const serviceName = stripHtmlTags(serviceNameRaw) || 'service';

  const apiCities = await fetchServiceCitiesServer(serviceAlias);

  const normalized = (Array.isArray(apiCities) ? apiCities : [])
    .map((city) => {
      const cityName = normalizeCityField(city?.cityName || city?.name);
      const slug = normalizeCityField(city?.slug);
      if (!cityName || !slug) return null;
      return {
        cityName,
        name: cityName,
        slug: slugify(slug),
        isInternational: Boolean(city?.isInternational),
      };
    })
    .filter(Boolean);

  const split = splitCities(normalized);

  return (
    <ServiceCitiesPage
      serviceAlias={serviceAlias}
      serviceName={serviceName}
      domesticCities={split.domestic}
      internationalCities={split.international}
    />
  );
}
