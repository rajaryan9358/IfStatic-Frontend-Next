import LanderPage from '@/features/lander/LanderPage';
import {
  fetchPortfoliosServer,
  fetchServicesServer,
  fetchTestimonialsServer,
} from '@/services/publicData.service';

export const metadata = {
  title: 'Company Lander',
  description: 'Single-page company lander with services, clients, portfolio, testimonials, and pricing.',
};

export default async function Page() {
  const [services, portfoliosResult, testimonialsResult] = await Promise.all([
    fetchServicesServer(),
    fetchPortfoliosServer('home'),
    fetchTestimonialsServer('/'),
  ]);

  return (
    <LanderPage
      initialServices={services}
      initialPortfolios={portfoliosResult.data}
      initialTestimonials={testimonialsResult.data}
    />
  );
}