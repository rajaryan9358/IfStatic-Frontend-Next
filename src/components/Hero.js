"use client";

import React, { useState, useEffect } from 'react';
import RequestQuoteModal from './RequestQuoteModal';

const Hero = ({ initialServices = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const slides = [
    {
      title: 'Launch Mobile & Web Apps',
      subtitle: 'Built for Growth',
      description:
        "We design and engineer mobile apps, WordPress sites, and custom web platforms that ship fast, scale reliably, and delight users. From discovery to UX/UI, APIs, QA, and cloud deployment, we deliver polished, accessible products on every device with transparent communication, sprint-based delivery, and measurable milestones that reduce technical risk and drive outcomes.",
    },
    {
      title: 'AI & IoT Integrations',
      subtitle: 'Future-Ready Stack',
      description:
        "Integrate AI workflows, automation, and IoT solutions to streamline operations and unlock actionable data. We connect cloud services, device fleets, data pipelines, and APIs to orchestrate events, automate tasks, and surface insights. From edge to cloud, we emphasize security, observability, and scalability so your products stay resilient as predictive analytics, vision, voice, or sensor workloads grow.",
    },
    {
      title: 'Marketing, SEO & CRO',
      subtitle: 'Revenue-Focused',
      description:
        'Full-funnel digital marketing, SEO, and conversion optimization to drive traffic, capture demand, and grow your brand. We blend technical SEO, content, paid media, and landing page CRO to improve rankings, lower acquisition costs, and boost conversion rates. With analytics, heatmaps, and testing, every tactic aligns to revenue goals, increasing ROI across channels.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-slide">
          <div className="hero-content">
            <h1 className="hero-title">
              {slides[currentSlide].title}
              <br />
              through <span className="hero-highlight">{slides[currentSlide].subtitle}</span>
            </h1>
            <p className="hero-description">{slides[currentSlide].description}</p>
            <button className="hero-cta" onClick={() => setIsModalOpen(true)}>
              Get Started
            </button>
          </div>
          <div className="hero-image">
            <img
              src="/images/IfStatic_Technologies.png"
              alt="IFSTATIC Technologies team"
              className="hero-image-img"
            />
          </div>
        </div>

        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <RequestQuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={initialServices}
      />
    </section>
  );
};

export default Hero;
