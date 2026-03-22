import { notFound } from 'next/navigation';
import ProjectDetails from '@/views/ProjectDetails';
import {
  fetchPortfolioBySlugServer,
  fetchPortfoliosServer,
  fetchServicesServer,
  fetchTestimonialsServer,
} from '@/services/publicData.service';

export const dynamic = 'force-static';
export const revalidate = 60;

const getSlug = (resolvedParams) =>
  resolvedParams?.slug ? String(resolvedParams.slug) : '';

export async function generateStaticParams() {
  try {
    const result = await fetchPortfoliosServer('all');
    const portfolios = Array.isArray(result?.data) ? result.data : [];
    const slugs = portfolios
      .map((p) => (p?.slug ? String(p.slug) : ''))
      .filter(Boolean);

    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function ProjectDetailsRoute({ params }) {
  const resolvedParams = (await params) || {};
  const slug = getSlug(resolvedParams);

  const [portfolio, services, testimonialsResult] = await Promise.all([
    fetchPortfolioBySlugServer(slug),
    fetchServicesServer(),
    fetchTestimonialsServer(slug ? `/portfolio/${slug}` : undefined),
  ]);

  if (!portfolio) {
    notFound();
  }

  return (
    <><ProjectDetails
        slug={slug}
        initialPortfolio={portfolio}
        initialMeta={null}
        initialServices={services}
        initialTestimonials={
          Array.isArray(testimonialsResult?.data) ? testimonialsResult.data : []
        }
        initialTestimonialsIsFallback={Boolean(testimonialsResult?.isFallback)}
      />
    </>
  );
}
