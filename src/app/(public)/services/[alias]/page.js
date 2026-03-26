import ServiceDetail from '@/views/ServiceDetail';
import {
  fetchPortfoliosFilteredServer,
  fetchServiceByAliasServer,
  fetchServiceCitiesServer,
  fetchTestimonialsServer,
  resolveServiceAlias,
} from '@/services/publicData.service';

const getAlias = (resolvedParams) =>
  resolvedParams?.alias ? String(resolvedParams.alias) : '';

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
};

const normalizeCityField = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';

  const lower = normalized.toLowerCase();
  if (['null', 'undefined', 'n/a', 'na', 'none'].includes(lower)) {
    return '';
  }

  return normalized;
};

const hasValidServiceCity = (city) => {
  const cityName = normalizeCityField(city?.cityName || city?.name);
  const citySlug = normalizeCityField(city?.slug);
  return Boolean(cityName && citySlug);
};

export async function generateMetadata({ params }) {
  const resolvedParams = (await params) || {};
  const alias = getAlias(resolvedParams);
  const service = await fetchServiceByAliasServer(alias);

  return {
    title: toNonEmptyString(service?.metaTitle),
    description: toNonEmptyString(service?.metaDescription),
  };
}

export default async function ServiceDetailRoute({ params }) {
  const resolvedParams = (await params) || {};
  const alias = getAlias(resolvedParams);
  const canonicalAlias = resolveServiceAlias(alias);

  const service = await fetchServiceByAliasServer(alias);

  const serviceAlias = service?.alias || canonicalAlias;

  const [testimonialsResult, portfoliosResult, serviceCities] = await Promise.all([
    fetchTestimonialsServer(`/services/${serviceAlias}`),
    fetchPortfoliosFilteredServer({
      serviceAlias,
      serviceId: service?.id,
    }),
    fetchServiceCitiesServer(serviceAlias),
  ]);

  const hasServiceCities = (Array.isArray(serviceCities) ? serviceCities : []).some(hasValidServiceCity);

  return (
    <><ServiceDetail
      key={serviceAlias || alias}
        initialService={service}
        initialPortfolios={portfoliosResult.data}
        initialPortfoliosIsFallback={portfoliosResult.isFallback}
        initialTestimonials={testimonialsResult.data}
        initialTestimonialsIsFallback={testimonialsResult.isFallback}
        hasServiceCities={hasServiceCities}
        alias={serviceAlias}
      />
    </>
  );
}
