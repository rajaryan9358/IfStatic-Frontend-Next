"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';


const stripHtmlToText = (value = '') => {
  const input = String(value ?? '');
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const Services = ({ initialServices = null }) => {
  const services = Array.isArray(initialServices) ? initialServices : [];

  const mappedServices = useMemo(() => {
    if (!services.length) {
      return [];
    }
    return services.map((service) => {
      const shortDescription =
        service.shortDescription ||
        service.description ||
        service.heroDescription ||
        'Contact us to learn more about this service.';

      const iconUrl = service.service_icon || service.iconUrl || service.iconURL;
      return {
        ...service,
        iconUrl,
        icon: service.icon || 'monitor',
        shortDescription,
      };
    });
  }, [services]);

  const renderIcon = (iconType, iconUrl) => {
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt={`${iconType || 'service'} icon`}
          className="service-icon-image"
          loading="lazy"
        />
      );
    }
    switch (iconType) {
      case 'monitor':
        return (
          <svg viewBox="0 0 64 64" className="service-icon">
            <rect x="8" y="12" width="48" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
            <line x1="8" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="3" />
            <rect x="20" y="48" width="24" height="4" rx="1" fill="currentColor" />
          </svg>
        );
      case 'mobile':
        return (
          <svg viewBox="0 0 64 64" className="service-icon">
            <rect x="18" y="8" width="28" height="48" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
            <line x1="28" y1="50" x2="36" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'palette':
        return (
          <svg viewBox="0 0 64 64" className="service-icon">
            <path
              d="M32 8 C 16 8, 8 16, 8 32 C 8 48, 16 56, 32 56 C 40 56, 48 52, 48 44 C 48 40, 44 38, 40 38 L 32 38"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <circle cx="22" cy="24" r="3" fill="currentColor" />
            <circle cx="32" cy="20" r="3" fill="currentColor" />
            <circle cx="42" cy="24" r="3" fill="currentColor" />
            <circle cx="24" cy="36" r="3" fill="currentColor" />
          </svg>
        );
      case 'code':
        return (
          <svg viewBox="0 0 64 64" className="service-icon">
            <path
              d="M 20 20 L 10 32 L 20 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 44 20 L 54 32 L 44 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="35" y1="16" x2="29" y2="48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'seo':
        return (
          <svg viewBox="0 0 64 64" className="service-icon">
            <path
              d="M 20 20 L 10 32 L 20 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 44 20 L 54 32 L 44 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="26" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg viewBox="0 0 64 64" className="service-icon">
            <path
              d="M 20 20 L 10 32 L 20 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 44 20 L 54 32 L 44 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="26" y1="26" x2="38" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="26" y1="38" x2="38" y2="26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className="services">
      <div className="services-container">
        <div className="services-header">
          <p className="services-label">OUR SERVICES</p>
          <h2 className="services-title">What We're Offering?</h2>
        </div>
      </div>

      <p className="services-description services-description--fullwidth">
        We provide end-to-end digital solutions to help your business grow, scale, and stand out in a competitive market. From mobile apps and websites to custom software, design, marketing, and AI integration, our services are built with performance, user experience, and long-term success in mind. We focus on delivering reliable, scalable, and result-driven solutions tailored to your unique business needs.
      </p>

      <div className="services-container">
        <div className="services-grid">
          {mappedServices.map((service) => {
            const servicePath = `/services/${service.alias}`;
            return (
              <Link href={servicePath} key={service.id || service.alias} className="service-card">
                <div className="service-icon-wrapper">{renderIcon(service.icon, service.iconUrl)}</div>
                <h3 className="service-title">{service.name}</h3>
                <p className="service-description">{stripHtmlToText(service.shortDescription)}</p>
<span className="service-link">Learn more</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
