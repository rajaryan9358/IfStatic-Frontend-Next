import Link from 'next/link';
import RichText from '@/components/RichText';

const ServiceCityDetailPage = ({
  serviceAlias = '',
  serviceName = 'service',
  citySlug = '',
  cityName = '',
  heroDescription = '',
}) => {
  const safeAlias = String(serviceAlias || '').trim();
  const safeServiceName = String(serviceName || 'service').trim() || 'service';
  const safeCityName = String(cityName || citySlug || '').trim();

  return (
    <article className="service-city-page">
      <div className="service-city-page__container">
        <nav className="service-city-page__crumbs">
          <Link className="service-city-page__crumb" href={`/services/${encodeURIComponent(safeAlias)}`}>
            {safeServiceName}
          </Link>
          <span className="service-city-page__crumb-sep">/</span>
          <Link className="service-city-page__crumb" href={`/services/${encodeURIComponent(safeAlias)}/cities`}>
            Cities
          </Link>
        </nav>

        <header className="service-city-page__header">
          <h1 className="service-city-page__title">
            {safeServiceName} in {safeCityName}
          </h1>
          <p className="service-city-page__meta">
            Local {safeServiceName} support for teams in {safeCityName}.
          </p>
        </header>

        <div className="service-city-page__content">
          {heroDescription ? (
            <RichText as="div" className="service-city-page__rich" content={heroDescription} />
          ) : (
            <p>
              If you’re looking for reliable {safeServiceName} support in {safeCityName}, we can help you plan,
              build, and launch with a team that understands quality, timelines, and long-term maintainability.
            </p>
          )}

          <h2>What you can expect</h2>
          <ul>
            <li>Discovery and planning tailored to your goals</li>
            <li>Design + development with clear milestones</li>
            <li>Testing, launch support, and ongoing improvements</li>
          </ul>

          <h2>Next steps</h2>
          <p>
            Explore the main service page for full details, or browse other locations.
          </p>

          <div className="service-city-page__actions">
            <Link className="service-city-page__button" href={`/services/${encodeURIComponent(safeAlias)}`}>
              View {safeServiceName}
            </Link>
            <Link className="service-city-page__button service-city-page__button--secondary" href={`/services/${encodeURIComponent(safeAlias)}/cities`}>
              View all cities
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ServiceCityDetailPage;
