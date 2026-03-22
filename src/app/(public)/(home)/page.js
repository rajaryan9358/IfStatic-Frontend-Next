import HomeClient from '@/components/HomeClient';
import {
  fetchPortfoliosServer,
  fetchServicesServer,
  fetchTestimonialsServer,
} from '@/services/publicData.service';

export default async function HomePage() {
  const [services, portfoliosResult, testimonialsResult] = await Promise.all([
    fetchServicesServer(),
    fetchPortfoliosServer('home'),
    fetchTestimonialsServer('/'),
  ]);

  return (
    <><HomeClient
        initialServices={services}
        initialPortfolios={portfoliosResult.data}
        initialPortfoliosIsFallback={portfoliosResult.isFallback}
        initialTestimonials={testimonialsResult.data}
      />
    </>
  );
}
