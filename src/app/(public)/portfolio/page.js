import PortfolioPage from '@/views/PortfolioPage';
import { fetchPortfoliosServer, fetchServicesServer } from '@/services/publicData.service';

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
