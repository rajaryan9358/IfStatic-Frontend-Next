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

  return (
    <div className="service-cities-page">
      <div className="service-cities-page__container">
        <h1 className="service-cities-page__title">Looking for local {safeName} support?</h1>
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
      </div>
    </div>
  );
};

export default ServiceCitiesPage;
