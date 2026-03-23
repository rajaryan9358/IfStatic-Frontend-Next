import PortfolioPage from '@/views/PortfolioPage';
import { fetchPortfoliosFilteredServer, fetchServicesServer } from '@/services/publicData.service';
import { getSeoMeta } from '@/lib/seoMeta.server';
import { redirect } from 'next/navigation';

const normalize = (value = '') =>
  decodeURIComponent(String(value))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
};

export async function generateMetadata({ params }) {
  const resolvedParams = (await params) || {};
  const serviceSlug = resolvedParams.serviceSlug || '';
  const normalized = normalize(serviceSlug);
  const meta = await getSeoMeta({ pageType: 'portfolios', subType: normalized });

  return {
    title: toNonEmptyString(meta?.meta_title),
    description: toNonEmptyString(meta?.meta_description),
  };
}

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
