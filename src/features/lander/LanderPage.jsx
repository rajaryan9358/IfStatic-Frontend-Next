'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './lander.module.css';

const sliderItems = [
  {
    title: 'Build fast, modern web products',
    subtitle: 'From idea to production with a team that ships quickly.',
  },
  {
    title: 'Scale with reliable engineering',
    subtitle: 'Clean architecture, strong QA, and long-term maintainability.',
  },
  {
    title: 'Design and development together',
    subtitle: 'Clear UX and robust code for better conversion and retention.',
  },
];

const fallbackServices = [
  { name: 'Web Development', detail: 'Responsive websites and web apps tailored to your goals.' },
  { name: 'Mobile Apps', detail: 'Android and iOS experiences focused on performance and UX.' },
  { name: 'UI/UX Design', detail: 'User-centered interfaces that improve engagement and clarity.' },
  { name: 'E-commerce', detail: 'Conversion-ready online stores with secure checkout flows.' },
  { name: 'SEO & Performance', detail: 'Technical optimization for discoverability and speed.' },
  { name: 'Maintenance', detail: 'Ongoing support, updates, monitoring, and improvements.' },
];

const clients = ['Nova Retail', 'BluePeak Health', 'UrbanNest', 'Apex Logistics', 'CloudForge', 'GreenLeaf'];

const fallbackPortfolio = [
  { title: 'Nova Commerce', type: 'E-commerce Platform', summary: 'High-converting storefront with integrated analytics.' },
  { title: 'MediTrack Pro', type: 'Healthcare Dashboard', summary: 'Patient-centric dashboard for operations and reporting.' },
  { title: 'RideFlow', type: 'Transport App', summary: 'Booking and dispatch app with real-time tracking.' },
  { title: 'SkillBridge', type: 'Learning Portal', summary: 'Course platform with memberships and progress tracking.' },
  { title: 'EstatePulse', type: 'Property Marketplace', summary: 'Modern listings and lead funnel for real estate teams.' },
  { title: 'FinPilot', type: 'Finance Tool', summary: 'Insights dashboard to simplify cash-flow decisions.' },
];

const fallbackTestimonials = [
  {
    name: 'Riya Sharma',
    role: 'Founder, Nova Retail',
    feedback: 'They transformed our idea into a polished platform and delivered on time.',
  },
  {
    name: 'Daniel Cruz',
    role: 'COO, Apex Logistics',
    feedback: 'Great communication and technical depth. The product quality is excellent.',
  },
  {
    name: 'Ankit Mehta',
    role: 'Product Lead, UrbanNest',
    feedback: 'Our user engagement improved significantly after the redesign and rebuild.',
  },
];

const pricing = [
  {
    name: 'Starter',
    price: '$499',
    desc: 'For quick MVPs and landing pages',
    points: ['Up to 5 pages', 'Basic SEO setup', '2 weeks support'],
  },
  {
    name: 'Growth',
    price: '$1,499',
    desc: 'For growing businesses',
    points: ['Custom design', 'CMS integration', '1 month support'],
    featured: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    desc: 'For large or complex products',
    points: ['Product discovery', 'Advanced integrations', 'Dedicated support'],
  },
];

const phoneWidgets = [
  { id: 'tasks', title: 'Tasks', value: '12 Pending', startX: -370, startY: -120, startR: -18, endX: -16, endY: 16, endR: -2 },
  { id: 'sales', title: 'Sales', value: '+24%', startX: 360, startY: -110, startR: 17, endX: 16, endY: 16, endR: 3 },
  { id: 'users', title: 'Users', value: '1.8K', startX: -390, startY: 80, startR: -15, endX: -16, endY: 110, endR: -2 },
  { id: 'rating', title: 'Rating', value: '4.9 ★', startX: 380, startY: 84, startR: 16, endX: 16, endY: 110, endR: 2 },
  { id: 'uptime', title: 'Uptime', value: '99.98%', startX: 0, startY: 220, startR: 0, endX: 0, endY: 205, endR: 0 },
];

const lerp = (from, to, progress) => from + (to - from) * progress;

const stripHtml = (value = '') =>
  String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export default function LanderPage({
  initialServices = [],
  initialPortfolios = [],
  initialTestimonials = [],
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [parallaxProgress, setParallaxProgress] = useState(0);
  const parallaxRef = useRef(null);

  const activeSlide = useMemo(() => sliderItems[slideIndex], [slideIndex]);

  const services = useMemo(() => {
    if (!Array.isArray(initialServices) || !initialServices.length) return fallbackServices;

    const mapped = initialServices
      .map((service) => {
        const name = service?.name || service?.title || '';
        const detail =
          stripHtml(service?.shortDescription || service?.description || service?.heroDescription || '') ||
          'Contact us to learn more about this service.';

        if (!name) return null;
        return { name, detail };
      })
      .filter(Boolean);

    return mapped.length ? mapped : fallbackServices;
  }, [initialServices]);

  const portfolio = useMemo(() => {
    if (!Array.isArray(initialPortfolios) || !initialPortfolios.length) return fallbackPortfolio;

    const mapped = initialPortfolios
      .slice(0, 6)
      .map((item) => {
        const title = item?.name || item?.title || 'Project';
        const type = item?.serviceName || item?.heroCategory || item?.category || 'Project';
        const summary = stripHtml(item?.summary || item?.description || '') || 'Project details available on request.';

        return { title, type, summary };
      })
      .filter((item) => item.title);

    return mapped.length ? mapped : fallbackPortfolio;
  }, [initialPortfolios]);

  const testimonials = useMemo(() => {
    if (!Array.isArray(initialTestimonials) || !initialTestimonials.length) return fallbackTestimonials;

    const mapped = initialTestimonials
      .slice(0, 6)
      .map((item) => {
        const name = item?.name || 'Client';
        const role = item?.handle || item?.company || item?.location || 'Verified Client';
        const feedback = stripHtml(item?.testimonial || item?.feedback || '') || 'Great experience working together.';

        return { name, role, feedback };
      })
      .filter((item) => item.feedback);

    return mapped.length ? mapped : fallbackTestimonials;
  }, [initialTestimonials]);

  const mobileServiceDetails = useMemo(() => {
    const serviceMatch = services.find((item) => /mobile|app|ios|android/i.test(`${item.name} ${item.detail}`));
    const service =
      serviceMatch || {
        name: 'Mobile App Development',
        detail:
          'We build scalable Android and iOS applications with clean architecture, smooth UI performance, and measurable business outcomes.',
      };

    const matchedPortfolio = portfolio
      .filter((item) => /mobile|app|ios|android/i.test(`${item.title} ${item.type} ${item.summary}`))
      .slice(0, 4);

    const matchedTestimonials = testimonials
      .filter((item) => /mobile|app|ios|android|product/i.test(`${item.feedback} ${item.role}`))
      .slice(0, 4);

    return {
      service,
      portfolio: matchedPortfolio.length ? matchedPortfolio : portfolio.slice(0, 4),
      testimonials: matchedTestimonials.length ? matchedTestimonials : testimonials.slice(0, 4),
    };
  }, [services, portfolio, testimonials]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % sliderItems.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const section = parallaxRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const maxScrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
      const scrolledInSection = Math.min(Math.max(-rect.top, 0), maxScrollable);
      const progress = Math.min(Math.max(scrolledInSection / maxScrollable, 0), 1);
      setParallaxProgress(progress);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const phoneTilt = lerp(-10, 10, parallaxProgress);
  const phoneLift = lerp(20, -20, parallaxProgress);
  const phoneScale = lerp(0.95, 1.03, parallaxProgress);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <img src="/logo_secondary.png" alt="Company logo" className={styles.logo} />

          <div className={styles.headerInfo}>
            <a href="tel:+911234567890">+91 12345 67890</a>
            <a href="mailto:hello@ifstatic.com">hello@ifstatic.com</a>
          </div>

          <div className={styles.socials}>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </header>

      <section className={styles.heroRow}>
        <div className={styles.sliderWrap}>
          <div className={styles.slideCard}>
            <p className={styles.slideBadge}>Trusted Software Partner</p>
            <h1>{activeSlide.title}</h1>
            <p>{activeSlide.subtitle}</p>
          </div>
          <div className={styles.dots}>
            {sliderItems.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} ${index === slideIndex ? styles.dotActive : ''}`}
                onClick={() => setSlideIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2>Enquiry Form</h2>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Email Address" required />
          <input type="tel" placeholder="Phone Number" required />
          <textarea rows={4} placeholder="Tell us about your project" required />
          <button type="submit">Send Enquiry</button>
          {submitted ? <span className={styles.success}>Thanks! We will reach out shortly.</span> : null}
        </form>
      </section>

      <section className={styles.parallaxBand} ref={parallaxRef}>
        <div className={styles.parallaxInner}>
          <div className={styles.centerColumn}>
            <div className={styles.mobileStage}>
              <div
                className={styles.mobileShell}
                style={{
                  transform: `translateY(${phoneLift}px) rotate(${phoneTilt}deg) scale(${phoneScale})`,
                }}
              >
                <div className={styles.mobileNotch} />
                <div className={styles.mobileScreen}>
                  <p className={styles.mobileLabel}>Product Dashboard</p>
                  <h3>Interactive Mobile UI</h3>
                  <span>Widgets align as you scroll</span>

                  {phoneWidgets.map((widget) => {
                    const x = lerp(widget.startX, widget.endX, parallaxProgress);
                    const y = lerp(widget.startY, widget.endY, parallaxProgress);
                    const rotate = lerp(widget.startR, widget.endR, parallaxProgress);
                    const scale = lerp(0.84, 1, parallaxProgress);
                    const opacity = lerp(0.25, 1, parallaxProgress);

                    return (
                      <div
                        key={widget.id}
                        className={styles.mobileWidget}
                        style={{
                          transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
                          opacity,
                        }}
                      >
                        <strong>{widget.title}</strong>
                        <span>{widget.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.sideColumn} ${styles.rightDetailsColumn}`}>
            <h2>Mobile App Development</h2>
            <div className={styles.rightDetailsRail}>
              <article
                className={styles.detailCard}
                style={{
                  transform: `translateX(${lerp(30, 0, parallaxProgress)}px) translateY(${lerp(20, 0, parallaxProgress)}px)`,
                  opacity: lerp(0.25, 1, parallaxProgress),
                }}
              >
                <span className={styles.detailLabel}>Service Details</span>
                <h3>{mobileServiceDetails.service.name}</h3>
                <p>{mobileServiceDetails.service.detail}</p>
              </article>

              <article
                className={styles.detailCard}
                style={{
                  transform: `translateX(${lerp(36, 0, parallaxProgress)}px) translateY(${lerp(18, 0, parallaxProgress)}px)`,
                  opacity: lerp(0.22, 1, parallaxProgress),
                }}
              >
                <span className={styles.detailLabel}>Capabilities</span>
                <div className={styles.detailList}>
                  {services.slice(0, 6).map((service) => (
                    <div key={service.name} className={styles.detailListItem}>
                      <h4>{service.name}</h4>
                      <p>{service.detail}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article
                className={styles.detailCard}
                style={{
                  transform: `translateX(${lerp(48, 0, parallaxProgress)}px) translateY(${lerp(16, 0, parallaxProgress)}px)`,
                  opacity: lerp(0.2, 1, parallaxProgress),
                }}
              >
                <span className={styles.detailLabel}>Portfolio</span>
                <div className={styles.detailList}>
                  {mobileServiceDetails.portfolio.map((item) => (
                    <div key={`${item.title}-${item.type}`} className={styles.detailListItem}>
                      <h4>{item.title}</h4>
                      <p>{item.summary}</p>
                      <span>{item.type}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article
                className={styles.detailCard}
                style={{
                  transform: `translateX(${lerp(62, 0, parallaxProgress)}px) translateY(${lerp(14, 0, parallaxProgress)}px)`,
                  opacity: lerp(0.15, 1, parallaxProgress),
                }}
              >
                <span className={styles.detailLabel}>Testimonials</span>
                <div className={styles.detailList}>
                  {mobileServiceDetails.testimonials.map((item, index) => (
                    <div key={`${item.name}-${item.role}-${index}`} className={styles.detailQuote}>
                      <p>“{item.feedback}”</p>
                      <h4>{item.name}</h4>
                      <span>{item.role}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionHead}>
          <h2>Our Clients</h2>
          <p>Brands that trusted us to build and scale their products.</p>
        </div>
        <div className={styles.clientsWrap}>
          {clients.map((client) => (
            <div key={client} className={styles.clientItem}>
              {client}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Portfolio</h2>
          <p>Selected work across industries and product types.</p>
        </div>
        <div className={styles.portfolioGrid}>
          {portfolio.map((item) => (
            <article key={item.title} className={styles.portfolioCard}>
              <span>{item.type}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Pricing</h2>
          <p>Simple pricing options based on your project needs.</p>
        </div>
        <div className={styles.pricingGrid}>
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={`${styles.pricingCard} ${plan.featured ? styles.pricingFeatured : ''}`}
            >
              <h3>{plan.name}</h3>
              <div className={styles.price}>{plan.price}</div>
              <p>{plan.desc}</p>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Ready to start your project?</h2>
        <p>Let’s discuss your idea and build something impactful together.</p>
        <a href="mailto:hello@ifstatic.com">Talk to us</a>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Ifstatic Technologies</p>
        <p>Web · Mobile · Design</p>
      </footer>

      <a
        href="https://wa.me/911234567890"
        target="_blank"
        rel="noreferrer"
        className={styles.whatsapp}
        aria-label="Chat on WhatsApp"
      >
        WhatsApp
      </a>
    </div>
  );
}