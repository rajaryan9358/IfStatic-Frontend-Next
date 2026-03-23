import { notFound } from 'next/navigation';
import ProjectDetails from '@/views/ProjectDetails';
import {
  fetchPortfolioBySlugServer,
  fetchPortfolioMetaBySlugServer,
  fetchPortfoliosServer,
  fetchServicesServer,
  fetchTestimonialsServer,
} from '@/services/publicData.service';

export const dynamic = 'force-static';
export const revalidate = 60;

const getSlug = (resolvedParams) =>
  resolvedParams?.slug ? String(resolvedParams.slug) : '';

const toNonEmptyString = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || undefined;
};

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

export async function generateMetadata({ params }) {
  const resolvedParams = (await params) || {};
  const slug = getSlug(resolvedParams);
  const meta = await fetchPortfolioMetaBySlugServer(slug);

  return {
    title: toNonEmptyString(meta?.metaTitle),
    description: toNonEmptyString(meta?.metaDescription),
  };
}

export default async function ProjectDetailsRoute({ params }) {
  const resolvedParams = (await params) || {};
  const slug = getSlug(resolvedParams);

  const [portfolioResult, servicesResult, testimonialsResult] = await Promise.allSettled([
    fetchPortfolioBySlugServer(slug),
    fetchServicesServer(),
    fetchTestimonialsServer(slug ? `/portfolio/${slug}` : undefined),
  ]);

  const portfolio = portfolioResult.status === 'fulfilled' ? portfolioResult.value : null;
  const services = servicesResult.status === 'fulfilled' ? servicesResult.value : [];
  const resolvedTestimonials =
    testimonialsResult.status === 'fulfilled'
      ? testimonialsResult.value
      : { data: [], isFallback: true };

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
          Array.isArray(resolvedTestimonials?.data) ? resolvedTestimonials.data : []
        }
        initialTestimonialsIsFallback={Boolean(resolvedTestimonials?.isFallback)}
      />
    </>
  );
}
