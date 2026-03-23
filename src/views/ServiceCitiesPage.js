"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';

const LocationIcon = ({ isInternational = false }) => {
  if (isInternational) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="service-cities-page__icon-svg">
        <path
          d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Zm0 0c2.3 2.48 3.57 5.63 3.57 9S14.3 18.52 12 21m0-18C9.7 5.48 8.43 8.63 8.43 12S9.7 18.52 12 21m-8.44-9h16.88M4.9 7.5h14.2M4.9 16.5h14.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="service-cities-page__icon-svg">
      <path
        d="M12 21s-5.25-5.1-5.25-10.13A5.25 5.25 0 1 1 17.25 10.87C17.25 15.9 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.75" r="1.9" fill="currentColor" />
    </svg>
  );
};

const CityCard = ({ city, title, serviceAlias, serviceName, isInternational = false }) => {
  const safeAlias = String(serviceAlias || '').trim();
  const safeName = String(serviceName || 'service').trim() || 'service';
  const cityName = String(city?.cityName || city?.name || '').trim();
  const citySlug = String(city?.slug || '').trim();

  if (!cityName || !citySlug) return null;

  return (
    <Link
      key={`${title}-${citySlug}-${cityName}`}
      className="service-cities-page__card"
      href={`/services/${encodeURIComponent(safeAlias)}/${encodeURIComponent(citySlug)}`}
    >
      <div className="service-cities-page__card-main">
        <div className="service-cities-page__icon-wrap">
          <LocationIcon isInternational={isInternational} />
        </div>
        <div className="service-cities-page__card-copy">
          <span className="service-cities-page__card-city">{cityName}</span>
          <span className="service-cities-page__card-service">{safeName}</span>
        </div>
      </div>
      <span className="service-cities-page__card-arrow" aria-hidden="true">→</span>
    </Link>
  );
};

const ServiceCitiesPage = ({
  serviceAlias = '',
  serviceName = 'service',
  domesticCities = [],
  internationalCities = [],
}) => {
  const safeName = String(serviceName || 'service').trim() || 'service';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(
    Array.isArray(domesticCities) && domesticCities.length > 0 ? 'domestic' : 'international'
  );
  const hasAnyCities = (Array.isArray(domesticCities) && domesticCities.length > 0)
    || (Array.isArray(internationalCities) && internationalCities.length > 0);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filterCities = (items) =>
    (Array.isArray(items) ? items : []).filter((city) => {
      if (!normalizedSearch) return true;
      const cityName = String(city?.cityName || city?.name || '').toLowerCase();
      return cityName.includes(normalizedSearch);
    });

  const domesticFiltered = useMemo(() => filterCities(domesticCities), [domesticCities, normalizedSearch]);
  const internationalFiltered = useMemo(
    () => filterCities(internationalCities),
    [internationalCities, normalizedSearch]
  );

  const activeCities = activeTab === 'international' ? internationalFiltered : domesticFiltered;
  const activeTitle = activeTab === 'international' ? 'International Cities' : 'Domestic Cities';

  return (
    <div className="service-cities-page">
      <div className="service-cities-page__container">
        <div className="service-cities-page__hero">
          <h1 className="service-cities-page__title">Looking for local {safeName} support?</h1>
          <p className="service-cities-page__subtitle">Browse by city:</p>
        </div>
        {hasAnyCities ? (
          <>
            <div className="service-cities-page__search-wrap">
              <span className="service-cities-page__search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                className="service-cities-page__search"
                placeholder="Search for a city or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="service-cities-page__tabs" role="tablist" aria-label="City type tabs">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'domestic'}
                className={`service-cities-page__tab${activeTab === 'domestic' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('domestic')}
              >
                Domestic Cities
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'international'}
                className={`service-cities-page__tab${activeTab === 'international' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('international')}
              >
                International Cities
              </button>
            </div>

            <section className="service-cities-page__section">
              <div className="service-cities-page__section-head">
                <h2 className="service-cities-page__column-title">{activeTitle}</h2>
                <span className="service-cities-page__count">{activeCities.length} cities</span>
              </div>

              {activeCities.length ? (
                <div className="service-cities-page__grid">
                  {activeCities.map((city) => (
                    <CityCard
                      key={`${activeTitle}-${city?.slug || city?.cityName || city?.name}`}
                      title={activeTitle}
                      city={city}
                      serviceAlias={serviceAlias}
                      serviceName={safeName}
                      isInternational={activeTab === 'international'}
                    />
                  ))}
                </div>
              ) : (
                <div className="service-cities-page__empty">
                  No matching cities found for this group.
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="service-cities-page__empty-card">
            <p className="service-cities-page__subtitle">City-specific pages are not available for this service yet.</p>
            <div className="service-cities-page__columns">
              <div className="service-cities-page__column service-cities-page__column--single">
                <Link className="service-cities-page__back-link" href={`/services/${encodeURIComponent(String(serviceAlias || '').trim())}`}>
                  Back to {safeName}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCitiesPage;
