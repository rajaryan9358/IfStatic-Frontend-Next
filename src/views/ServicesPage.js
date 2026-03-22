"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Services from '../components/Services';
import RequestQuoteModal from '../components/RequestQuoteModal';

const ServicesPage = ({ initialServices = null }) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="services-page">
      <section className="services-page__hero">
        <div className="services-page__hero-content">
          <p className="services-page__badge">Services</p>
          <h1 className="services-page__title">End-to-end digital product teams</h1>
          <p className="services-page__subtitle">
            Strategy, design, engineering, and growth in one integrated squad. We build secure, scalable, and high-performing
            products that ship fast and stay maintainable.
          </p>
          <div className="services-page__actions">
            <button
              type="button"
              className="services-page__btn services-page__btn--primary"
              onClick={() => setIsQuoteOpen(true)}
            >
              Start a project
            </button>
            <Link href="/portfolio" className="services-page__btn services-page__btn--ghost">
              View portfolio
            </Link>
          </div>
          <div className="services-page__metrics">
            <div className="services-page__metric">
              <span className="services-page__metric-number">50+</span>
              <span className="services-page__metric-label">Projects delivered</span>
            </div>
            <div className="services-page__metric">
              <span className="services-page__metric-number">8+ yrs</span>
              <span className="services-page__metric-label">Average team tenure</span>
            </div>
            <div className="services-page__metric">
              <span className="services-page__metric-number">24/7</span>
              <span className="services-page__metric-label">Support & SLAs</span>
            </div>
          </div>
        </div>

        <div className="services-page__hero-panel">
          <h3>What we do</h3>
          <ul>
            <li>Product strategy & roadmap definition</li>
            <li>Design systems & UX/UI delivery</li>
            <li>Web, mobile, and API engineering</li>
            <li>Cloud-native, DevOps, and observability</li>
            <li>SEO, performance, and growth experiments</li>
          </ul>
          <Link href="/contact" className="services-page__panel-cta">
            Book a discovery call →
          </Link>
        </div>
      </section>

      <Services initialServices={initialServices} />

      <section className="services-page__process">
        <div className="services-page__process-card">
          <p className="services-page__badge services-page__badge--muted">How we work</p>
          <h2>From discovery to launch and beyond</h2>
          <p>
            We pair agile execution with strong architecture. Every engagement includes discovery workshops, weekly demos, QA
            automation, observability, and a clear rollout plan.
          </p>
          <div className="services-page__pill-row">
            <span className="services-page__pill">Discovery & architecture</span>
            <span className="services-page__pill">Design system-first UI</span>
            <span className="services-page__pill">CI/CD & QA automation</span>
            <span className="services-page__pill">Analytics & growth</span>
          </div>
          <Link href="/contact" className="services-page__btn services-page__btn--primary">
            Let’s talk delivery
          </Link>
        </div>
        <div className="services-page__process-points">
          <div>
            <h4>Product squads</h4>
            <p>Dedicated teams with PM, design, and engineering to own outcomes—not just tasks.</p>
          </div>
          <div>
            <h4>Quality by default</h4>
            <p>Automated testing, accessibility checks, and performance budgets baked into every sprint.</p>
          </div>
          <div>
            <h4>Transparent delivery</h4>
            <p>Weekly demos, roadmap visibility, and clear velocity tracking so you always know progress.</p>
          </div>
        </div>
      </section>

      <RequestQuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} services={initialServices} />
    </div>
  );
};

export default ServicesPage;
