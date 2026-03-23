import ServiceDetail from '@/views/ServiceDetail';
import {
  fetchPortfoliosFilteredServer,
  fetchServiceByAliasServer,
  fetchTestimonialsServer,
  resolveServiceAlias,
} from '@/services/publicData.service';

const getAlias = (resolvedParams) =>
  resolvedParams?.alias ? String(resolvedParams.alias) : '';

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
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

  const [testimonialsResult, portfoliosResult] = await Promise.all([
    fetchTestimonialsServer(`/services/${serviceAlias}`),
    fetchPortfoliosFilteredServer({
      serviceAlias,
      serviceId: service?.id,
    }),
  ]);

  return (
    <><ServiceDetail
      key={serviceAlias || alias}
        initialService={service}
        initialPortfolios={portfoliosResult.data}
        initialPortfoliosIsFallback={portfoliosResult.isFallback}
        initialTestimonials={testimonialsResult.data}
        initialTestimonialsIsFallback={testimonialsResult.isFallback}
        alias={serviceAlias}
      />
    </>
  );
}
