import { notFound } from 'next/navigation';

import ServiceDetail from '@/views/ServiceDetail';
import {
  fetchPortfoliosFilteredServer,
  fetchServiceByAliasServer,
  fetchServiceCityPageServer,
  fetchTestimonialsServer,
  resolveServiceAlias,
} from '@/services/publicData.service';

const getParam = (resolvedParams, key) =>
  resolvedParams?.[key] ? String(resolvedParams[key]) : '';

const preferNonEmpty = (primary, fallback) => {
  const p = typeof primary === 'string' ? primary.trim() : '';
  if (p) return primary;
  return fallback;
};

const preferNonEmptyArray = (primary, fallback) => {
  return Array.isArray(primary) && primary.length ? primary : fallback;
};

const mergeServiceWithCity = (service, city) => {
  const merged = { ...(service || {}) };
  if (!city || typeof city !== 'object') {
    return { mergedService: merged, sectionVisibility: undefined };
  }

  const cityObj = city;

  // Hero overrides
  merged.heroLabel = preferNonEmpty(cityObj.heroLabel, merged.heroLabel);
  merged.heroTitle = preferNonEmpty(cityObj.heroTitle, merged.heroTitle);
  merged.heroDescription = preferNonEmpty(cityObj.heroDescription, merged.heroDescription);
  merged.heroCtaText = preferNonEmpty(cityObj.heroCtaText, merged.heroCtaText);
  merged.heroMainImage = preferNonEmpty(cityObj.heroMainImage, merged.heroMainImage);

  // Process overrides (fallback to service when not set)
  if (cityObj.useProcessOverride) {
    merged.approachImage = preferNonEmpty(cityObj.approachImage, merged.approachImage);
    merged.processLabel = preferNonEmpty(cityObj.processLabel, merged.processLabel);
    merged.processTitle = preferNonEmpty(cityObj.processTitle, merged.processTitle);
    merged.approachList = preferNonEmptyArray(cityObj.approachList, merged.approachList);
  }

  if (cityObj.useMobileAppsOverride) {
    merged.mobileAppsLabel = preferNonEmpty(cityObj.mobileAppsLabel, merged.mobileAppsLabel);
    merged.mobileAppsTitle = preferNonEmpty(cityObj.mobileAppsTitle, merged.mobileAppsTitle);
    merged.mobileApps = preferNonEmptyArray(cityObj.mobileApps, merged.mobileApps);
  }

  // Tools + mobile apps always from service (no overrides)

  // FAQs overrides (fallback to service when not set)
  merged.faqs = preferNonEmptyArray(cityObj.faqs, merged.faqs);

  // SEO overrides
  merged.metaTitle = preferNonEmpty(cityObj.metaTitle, merged.metaTitle);
  merged.metaDescription = preferNonEmpty(cityObj.metaDescription, merged.metaDescription);
  merged.metaSchema = preferNonEmpty(cityObj.metaSchema, merged.metaSchema);
  merged.headTagManager = preferNonEmpty(cityObj.headTagManager, merged.headTagManager);
  merged.bodyTagManager = preferNonEmpty(cityObj.bodyTagManager, merged.bodyTagManager);

  const sectionVisibility = {
    hero: cityObj.showHero !== false,
    process: cityObj.showProcess !== false,
    tools: cityObj.showTools !== false,
    mobileApps: cityObj.showMobileApps !== false,
    faqs: cityObj.showFaqs !== false,
    portfolios: cityObj.showPortfolios !== false,
    testimonials: cityObj.showTestimonials !== false,
  };

  return { mergedService: merged, sectionVisibility };
};

export async function generateMetadata({ params }) {
  const resolvedParams = (await params) || {};
  const alias = getParam(resolvedParams, 'alias');
  const citySlug = getParam(resolvedParams, 'citySlug');
  const canonicalAlias = resolveServiceAlias(alias);

  const cityPage = await fetchServiceCityPageServer(canonicalAlias || alias, citySlug);
  const service = cityPage?.service;
  const city = cityPage?.city;

  const title =
    (typeof city?.metaTitle === 'string' && city.metaTitle.trim()) ||
    (typeof service?.metaTitle === 'string' && service.metaTitle.trim()) ||
    undefined;

  const description =
    (typeof city?.metaDescription === 'string' && city.metaDescription.trim()) ||
    (typeof service?.metaDescription === 'string' && service.metaDescription.trim()) ||
    undefined;

  return {
    title,
    description,
  };
}

export default async function ServiceCityRoute({ params }) {
  const resolvedParams = (await params) || {};
  const alias = getParam(resolvedParams, 'alias');
  const citySlug = getParam(resolvedParams, 'citySlug');
  const canonicalAlias = resolveServiceAlias(alias);

  const service = await fetchServiceByAliasServer(alias);
  const serviceAlias = service?.alias || canonicalAlias;

  const cityPage = await fetchServiceCityPageServer(serviceAlias, citySlug);
  if (!cityPage?.city) {
    notFound();
  }

  const { mergedService, sectionVisibility } = mergeServiceWithCity(
    cityPage?.service || service,
    cityPage?.city
  );

  const [testimonialsResult, portfoliosResult] = await Promise.all([
    fetchTestimonialsServer(`/services/${serviceAlias}`),
    fetchPortfoliosFilteredServer({
      serviceAlias,
      serviceId: mergedService?.id,
    }),
  ]);

  return (
    <ServiceDetail
      initialService={mergedService}
      initialPortfolios={portfoliosResult.data}
      initialPortfoliosIsFallback={portfoliosResult.isFallback}
      initialTestimonials={testimonialsResult.data}
      initialTestimonialsIsFallback={testimonialsResult.isFallback}
      alias={serviceAlias}
      sectionVisibility={{ ...(sectionVisibility || {}), localSupportCta: false }}
    />
  );
}
