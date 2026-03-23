import PortfolioPage from '@/views/PortfolioPage';
import { fetchPortfoliosServer, fetchServicesServer } from '@/services/publicData.service';
import { getSeoMeta } from '@/lib/seoMeta.server';

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
};

export async function generateMetadata() {
  const meta = await getSeoMeta({ pageType: 'portfolios', subType: '' });

  return {
    title: toNonEmptyString(meta?.meta_title),
    description: toNonEmptyString(meta?.meta_description),
  };
}

export default async function PortfolioRoute() {
  const [services, portfoliosResult] = await Promise.all([
    fetchServicesServer(),
    fetchPortfoliosServer('all'),
  ]);

  return (
    <><PortfolioPage
        initialServices={services}
        initialPortfolios={portfoliosResult.data}
        initialPortfoliosIsFallback={portfoliosResult.isFallback}
      />
    </>
  );
}
