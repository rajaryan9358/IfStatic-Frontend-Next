import PortfolioPage from '@/views/PortfolioPage';
import { fetchPortfoliosFilteredServer, fetchServicesServer } from '@/services/publicData.service';
import { redirect } from 'next/navigation';

const normalize = (value = '') =>
  decodeURIComponent(String(value))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

export default async function PortfolioByServiceRoute({ params }) {
  const resolvedParams = (await params) || {};
  const serviceSlug = resolvedParams.serviceSlug || '';

  const services = await fetchServicesServer();

  const normalized = normalize(serviceSlug);
  const matched = (services || []).find((svc) => normalize(svc.alias) === normalized);

  if (!matched) {
    redirect('/portfolio');
  }

  const portfoliosResult = await fetchPortfoliosFilteredServer({ serviceAlias: matched.alias });

  return (
    <><PortfolioPage
        serviceSlug={matched.alias}
        initialServices={services}
        initialPortfolios={portfoliosResult.data}
        initialPortfoliosIsFallback={portfoliosResult.isFallback}
      />
    </>
  );
}
