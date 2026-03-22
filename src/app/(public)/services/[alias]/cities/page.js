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

const defaultDomesticCities = [
  'Bengaluru',
  'Chennai',
  'Delhi',
  'Gurugram',
  'Hyderabad',
  'Jaipur',
  'Kolkata',
  'Mumbai',
  'Noida',
  'Pune',
].map((name) => ({ name, cityName: name, slug: slugify(name), isInternational: false }));

const defaultInternationalCities = [
  'New York',
  'London',
  'Dubai',
  'Singapore',
  'Toronto',
  'Sydney',
].map((name) => ({ name, cityName: name, slug: slugify(name), isInternational: true }));

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
      const cityName = String(city?.cityName || city?.name || '').trim();
      const slug = String(city?.slug || '').trim();
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

  const domesticCities = split.domestic.length ? split.domestic : defaultDomesticCities;
  const internationalCities = split.international.length
    ? split.international
    : defaultInternationalCities;

  return (
    <ServiceCitiesPage
      serviceAlias={serviceAlias}
      serviceName={serviceName}
      domesticCities={domesticCities}
      internationalCities={internationalCities}
    />
  );
}
