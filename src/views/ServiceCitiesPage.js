import Link from 'next/link';

const CityList = ({ title, items, serviceAlias, serviceName }) => {
  const safeAlias = String(serviceAlias || '').trim();
  const safeName = String(serviceName || 'service').trim() || 'service';

  return (
    <div className="service-cities-page__column">
      <h2 className="service-cities-page__column-title">{title}</h2>
      <div className="service-cities-page__list">
        {(Array.isArray(items) ? items : []).map((city) => {
          const cityName = String(city?.cityName || city?.name || '').trim();
          const citySlug = String(city?.slug || '').trim();
          if (!cityName || !citySlug) return null;

          return (
            <Link
              key={`${title}-${citySlug}-${cityName}`}
              className="service-cities-page__link"
              href={`/services/${encodeURIComponent(safeAlias)}/${encodeURIComponent(citySlug)}`}
            >
              {safeName} in {cityName}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const ServiceCitiesPage = ({
  serviceAlias = '',
  serviceName = 'service',
  domesticCities = [],
  internationalCities = [],
}) => {
  const safeName = String(serviceName || 'service').trim() || 'service';
  const hasAnyCities = (Array.isArray(domesticCities) && domesticCities.length > 0)
    || (Array.isArray(internationalCities) && internationalCities.length > 0);

  return (
    <div className="service-cities-page">
      <div className="service-cities-page__container">
        <h1 className="service-cities-page__title">Looking for local {safeName} support?</h1>
        {hasAnyCities ? (
          <>
            <p className="service-cities-page__subtitle">Browse by city:</p>

            <div className="service-cities-page__columns">
              <CityList
                title="Domestic Cities"
                items={domesticCities}
                serviceAlias={serviceAlias}
                serviceName={safeName}
              />
              <CityList
                title="International Cities"
                items={internationalCities}
                serviceAlias={serviceAlias}
                serviceName={safeName}
              />
            </div>
          </>
        ) : (
          <>
            <p className="service-cities-page__subtitle">City-specific pages are not available for this service yet.</p>
            <div className="service-cities-page__columns">
              <div className="service-cities-page__column">
                <Link className="service-cities-page__link" href={`/services/${encodeURIComponent(String(serviceAlias || '').trim())}`}>
                  Back to {safeName}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceCitiesPage;
