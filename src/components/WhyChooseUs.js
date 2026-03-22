import React from 'react';
import Link from 'next/link';

const reasons = [
  {
    title: 'Full-Service Delivery',
    description:
      'Mobile apps, WordPress, custom web, AI, IoT, marketing, and SEO—built and managed end-to-end.',
  },
  {
    title: 'AI-Driven & IoT-Ready',
    description: 'Automation, data pipelines, and connected devices that future-proof your products.',
  },
  {
    title: 'Growth & SEO First',
    description:
      'Performance-focused SEO, paid media, and CRO strategies to drive qualified traffic and revenue.',
  },
  {
    title: 'Transparent & On-Time',
    description: 'Clear communication, predictable delivery, and scalable architectures you can rely on.',
  },
];

const WhyChooseUs = () => (
  <section className="why-choose">
    <div className="why-choose-container">
      <div className="why-header">
        <p className="why-label">WHY CHOOSE US</p>
        <h2 className="why-title">We build, integrate, and market digital products</h2>
        <p className="why-subtitle">
          Your partner for apps, web, AI, IoT, and growth marketing under one roof.
        </p>
      </div>

      <div className="why-grid">
        {reasons.map((reason, index) => (
          <article key={reason.title} className="why-card">
            <span className="why-number">0{index + 1}</span>
            <h3 className="why-card-title">{reason.title}</h3>
            <p className="why-card-description">{reason.description}</p>
          </article>
        ))}
      </div>

      <div className="why-cta">
        <p className="why-cta-text">Ready to scale your digital presence?</p>
        <Link href="/contact" className="why-cta-button">
          Contact Us
        </Link>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
