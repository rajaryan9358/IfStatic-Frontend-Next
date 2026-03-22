"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import RequestQuoteModal from '../components/RequestQuoteModal';
import Testimonials from '../components/Testimonials';
import RichText from '../components/RichText';

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 }
};

const sectionTransition = (delay = 0) => ({
  duration: 0.6,
  ease: 'easeOut',
  delay
});

const stripHtmlTags = (value) => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const ServiceDetail = ({ initialService = null, initialPortfolios = null, initialPortfoliosIsFallback = false, initialTestimonials = null, initialTestimonialsIsFallback = false, sectionVisibility = null, alias = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const aliasFromUrl = useMemo(() => alias || pathname?.split('/')?.filter(Boolean).pop() || '', [alias, pathname]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [service, setService] = useState(initialService || null);
  const [portfolioItems, setPortfolioItems] = useState(Array.isArray(initialPortfolios) ? initialPortfolios : []);
  const [isLoading, setIsLoading] = useState(!initialService);
  const [errorMessage, setErrorMessage] = useState('');
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [toolPopupPos, setToolPopupPos] = useState({ top: 0, left: 0 });
  const hideToolTimerRef = useRef(null);
  const autoScrollRef = useRef(null);


  const servicePagePath = `/services/${aliasFromUrl}`;
  const resolvedService = service || {};

  const visibility = sectionVisibility && typeof sectionVisibility === 'object' ? sectionVisibility : {};
  const showHero = visibility.hero !== false;
  const showProcess = visibility.process !== false;
  const showTools = visibility.tools !== false;
  const showMobileApps = visibility.mobileApps !== false;
  const showFaqs = visibility.faqs !== false;
  const showLocalSupportCta = visibility.localSupportCta !== false;
  const showPortfolios = visibility.portfolios !== false;
  const showTestimonials = visibility.testimonials !== false;
  const rawFaqs = resolvedService?.faqs;
  const serviceNameForCopy = useMemo(() => {
    const candidate = resolvedService?.name || resolvedService?.title || resolvedService?.heroTitle || '';
    const stripped = stripHtmlTags(candidate);
    return stripped || 'service';
  }, [resolvedService?.name, resolvedService?.title, resolvedService?.heroTitle]);


  const processSteps = useMemo(() => resolvedService.approachList || [], [resolvedService]);
  const toolsToRender = useMemo(() => resolvedService.toolsList || [], [resolvedService]);
  const mobileAppsToRender = useMemo(() => resolvedService.mobileApps || [], [resolvedService]);
  const faqsToRender = useMemo(() => {
    const source = Array.isArray(rawFaqs) ? rawFaqs : [];
    return [...source].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawFaqs]);
  const hasFaqs = faqsToRender.length > 0;
  const isSingle = portfolioItems.length === 1;

  const handleMouseDown = (e) => {
    stopAutoScroll();
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    const cardWidth = 900;
    const gap = 32;
    const newIndex = Math.round(container.scrollLeft / (cardWidth + gap));
    setCurrentIndex(newIndex);
    startAutoScroll();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    stopAutoScroll();
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    const container = scrollContainerRef.current;
    const cardWidth = 900;
    const gap = 32;
    const newIndex = Math.round(container.scrollLeft / (cardWidth + gap));
    setCurrentIndex(newIndex);
    startAutoScroll();
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const scroll = (direction) => {
    if (!portfolioItems.length) {
      return;
    }
    stopAutoScroll();
    const container = scrollContainerRef.current;
    const cardWidth = 900;
    const gap = 32;
    const scrollAmount = cardWidth + gap;
    
    let newIndex;
    if (direction === 'left') {
      newIndex = Math.max(0, currentIndex - 1);
      container.scrollLeft -= scrollAmount;
    } else {
      newIndex = Math.min(portfolioItems.length - 1, currentIndex + 1);
      container.scrollLeft += scrollAmount;
    }
    setCurrentIndex(newIndex);
    startAutoScroll();
  };

  const handleCardMouseEnter = () => {
    stopAutoScroll();
  };

  const handleCardMouseLeave = () => {
    startAutoScroll();
  };

  const scrollToIndex = (index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = 900;
    const gap = 32;
    const scrollAmount = (cardWidth + gap) * index;
    container.scrollTo({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const startAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    if (portfolioItems.length < 2) {
      return;
    }
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        let nextDirection = direction;
        if (prevIndex === portfolioItems.length - 1) {
          nextDirection = -1;
        } else if (prevIndex === 0) {
          nextDirection = 1;
        }
        if (nextDirection !== direction) {
          setDirection(nextDirection);
        }

        const nextIndex = Math.max(0, Math.min(portfolioItems.length - 1, prevIndex + nextDirection));
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 5000);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const clearHideToolTimer = () => {
    if (hideToolTimerRef.current) {
      clearTimeout(hideToolTimerRef.current);
      hideToolTimerRef.current = null;
    }
  };

  const handleToolEnter = (tool, event) => {
    clearHideToolTimer();
    const rect = event.currentTarget.getBoundingClientRect();
    setToolPopupPos({
      top: rect.top + window.scrollY - 12,
      left: rect.left + window.scrollX + rect.width / 2
    });
    setHoveredTool(tool);
  };

  const handleToolLeave = () => {
    hideToolTimerRef.current = setTimeout(() => {
      setHoveredTool(null);
    }, 120);
  };

  const handlePopupEnter = () => clearHideToolTimer();
  const handlePopupLeave = () => setHoveredTool(null);

  useEffect(() => {
    setPortfolioItems(Array.isArray(initialPortfolios) ? initialPortfolios : []);
    setService(initialService || null);
    setErrorMessage(initialService ? '' : 'Service not found.');
    setIsLoading(!initialService);
  }, [initialService, initialPortfolios]);

  useEffect(() => {
    setOpenFaqIndex(null);
  }, [aliasFromUrl]);

  useEffect(() => {
    startAutoScroll();

    return () => {
      stopAutoScroll();
    };
  }, [portfolioItems.length]);

  if (isLoading) {
    return (
      <div className="service-detail-loading-screen" aria-live="polite" aria-busy="true">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-text">Loading</p>
      </div>
    );
  }

  return (
    <div className="app-development-page">
      {showHero && (
      <motion.section
        className="service-hero"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={sectionTransition(0)}
      >
        <div className="service-hero-container">
          <div className="service-hero-content">
            <RichText as="p" className="service-label" content={resolvedService.heroLabel} />
            <RichText as="h1" className="service-title" content={resolvedService.heroTitle} />
            <RichText as="p" className="service-description" content={resolvedService.heroDescription} />
            {errorMessage && <p className="service-status warning">{errorMessage}</p>}
            {isLoading && <p className="service-status">Loading latest content...</p>}
            <button className="service-cta" onClick={() => setIsModalOpen(true)}>
              {resolvedService.heroCtaText || 'Get a free quote'}
            </button>
          </div>
          
          <div className="service-hero-image">
            {resolvedService.heroMainImage ? (
              <img
                src={resolvedService.heroMainImage}
                alt={resolvedService.heroTitle}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
            <svg viewBox="0 0 500 400" className="app-dev-illustration">
              {/* Main Phone */}
              <rect x="180" y="70" width="180" height="300" rx="25" fill="#2c3e50" stroke="#1a1a1a" strokeWidth="3"/>
              <rect x="190" y="85" width="160" height="270" rx="10" fill="#f8f9fa"/>
              
              {/* Phone Notch */}
              <rect x="220" y="75" width="80" height="15" rx="7.5" fill="#1a1a1a"/>
              
              {/* Video Icon */}
              <circle cx="280" cy="230" r="25" fill="#CB356B"/>
              <polygon points="270,230 290,220 290,240" fill="white"/>
              
              {/* Connection Lines */}
              <path d="M 160 150 Q 140 150 120 130" stroke="#666" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
              <path d="M 370 180 Q 390 180 410 160" stroke="#666" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
              <path d="M 280 380 Q 280 400 300 420" stroke="#666" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
              
              {/* User Avatar Box */}
              <rect x="80" y="40" width="70" height="70" rx="10" fill="#CB356B" opacity="0.9"/>
              <circle cx="115" cy="65" r="15" fill="white"/>
              <path d="M 100 85 Q 115 75 130 85" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              
              {/* Map Box */}
              <rect x="390" y="120" width="90" height="70" rx="10" fill="#f8f9fa" stroke="#e0e0e0" strokeWidth="2"/>
              <circle cx="435" cy="145" r="12" fill="#CB356B"/>
              <path d="M 435 150 L 435 165" stroke="#CB356B" strokeWidth="3"/>
              <path d="M 410 170 L 460 170" stroke="#e0e0e0" strokeWidth="2"/>
              <rect x="405" y="175" width="25" height="10" fill="#2c3e50"/>
              
              {/* Tablet */}
              <rect x="110" y="180" width="120" height="90" rx="8" fill="white" stroke="#2c3e50" strokeWidth="2"/>
              <rect x="120" y="190" width="100" height="70" rx="4" fill="#f8f9fa"/>
              <circle cx="170" cy="225" r="8" fill="#666"/>
              
              {/* Plant */}
              <ellipse cx="440" cy="370" rx="25" ry="10" fill="#e0e0e0"/>
              <rect x="435" y="330" width="10" height="40" fill="#8B4513"/>
              <ellipse cx="440" cy="310" rx="30" ry="35" fill="#CB356B" opacity="0.3"/>
              <path d="M 425 310 Q 415 295 420 280" stroke="#CB356B" strokeWidth="2" fill="none"/>
              <path d="M 455 310 Q 465 295 460 280" stroke="#CB356B" strokeWidth="2" fill="none"/>
              <ellipse cx="420" cy="280" rx="8" ry="12" fill="#CB356B"/>
              <ellipse cx="460" cy="280" rx="8" ry="12" fill="#CB356B"/>
              
              {/* Person */}
              <ellipse cx="115" cy="340" rx="18" ry="20" fill="#CB356B"/>
              <circle cx="115" cy="305" r="20" fill="#f4a6b8"/>
              <ellipse cx="108" cy="300" rx="3" ry="4" fill="#1a1a1a"/>
              <ellipse cx="122" cy="300" rx="3" ry="4" fill="#1a1a1a"/>
              <path d="M 110 308 Q 115 310 120 308" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
              <path d="M 105 290 Q 110 285 115 290" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
              <path d="M 115 290 Q 120 285 125 290" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
              <rect x="95" y="325" width="15" height="30" rx="5" fill="#CB356B"/>
              <rect x="120" y="325" width="15" height="30" rx="5" fill="#CB356B"/>
              <rect x="100" y="355" width="12" height="25" rx="6" fill="#2c3e50"/>
              <rect x="118" y="355" width="12" height="25" rx="6" fill="#2c3e50"/>
              
              {/* Letter A boxes */}
              <g opacity="0.4">
                <rect x="430" y="30" width="40" height="40" rx="8" fill="#f8f9fa" stroke="#e0e0e0" strokeWidth="1"/>
                <text x="450" y="55" fontSize="24" fill="#999" textAnchor="middle" fontWeight="bold">A</text>
                
                <rect x="340" y="50" width="35" height="35" rx="6" fill="#f8f9fa" stroke="#e0e0e0" strokeWidth="1"/>
                <text x="357.5" y="72" fontSize="20" fill="#999" textAnchor="middle" fontWeight="bold">A</text>
              </g>
            </svg>
            )}
          </div>
        </div>
      </motion.section>
      )}

      {showProcess && (
      <motion.section
        className="process-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.05)}
      >
        <div className="process-container">
          <div className="process-header">
            <RichText as="p" className="process-label" content={resolvedService.processLabel} />
            <RichText as="h2" className="process-title" content={resolvedService.processTitle} />
          </div>

          <div className="process-content">
            <div className="process-image">
              {resolvedService.approachImage ? (
                <img
                  src={resolvedService.approachImage}
                  alt="Process visual"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="image-placeholder">Image</div>
              )}
            </div>

            <div className="process-steps">
              {processSteps.map((step, index) => (
                <div key={index} className="process-step">
                  <RichText as="h3" className="step-title" content={step.title || step.heading} />
                  <RichText as="p" className="step-description" content={step.description} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
      )}

      {showTools && (
      <motion.section
        className="tools-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.1)}
      >
        <div className="tools-container">
          <div className="tools-header">
            <RichText as="p" className="tools-label" content={resolvedService.toolsLabel} />
            <RichText as="h2" className="tools-title" content={resolvedService.toolsTitle} />
          </div>

          <div className="tools-grid">
            {toolsToRender.map((tool, index) => (
              <div
                className="tool-card"
                key={tool.id || `${tool.name}-${index}`}
                onMouseEnter={(e) => handleToolEnter(tool, e)}
                onMouseLeave={handleToolLeave}
              >
                {tool.imageUrl ? (
                  <img
                    src={tool.imageUrl}
                    alt={tool.name}
                    className="tool-logo"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
      )}

      {showMobileApps && (
      <motion.section
        className="mobile-apps-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.15)}
      >
        <div className="mobile-apps-container">
          <div className="mobile-apps-header">
            <RichText as="p" className="mobile-apps-label" content={resolvedService.mobileAppsLabel} />
            <RichText as="h2" className="mobile-apps-title" content={resolvedService.mobileAppsTitle} />
          </div>

          <div className="mobile-apps-grid">
            {mobileAppsToRender.map((app, index) => (
              <div className="app-card" key={app.id || `${app.title}-${index}`}>
                <div className="app-icon">
                  {app.image ? (
                    <img
                      src={app.image}
                      alt={app.title}
                      className="app-illustration"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="app-icon-placeholder">{app.title?.charAt(0) || 'A'}</div>
                  )}
                </div>
                <RichText as="h3" className="app-title" content={app.title} />
                <RichText as="p" className="app-description" content={app.description} />
              </div>
            ))}
          </div>
        </div>
      </motion.section>
      )}

      {showLocalSupportCta && (
      <motion.section
        className="service-local-support-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.18)}
      >
        <div className="service-local-support-container">
          <h2 className="service-local-support-title">
            Looking for local {serviceNameForCopy} support?
          </h2>
          <button
            className="service-local-support-button"
            onClick={() => router.push(`/services/${aliasFromUrl}/cities`)}
          >
            Find {serviceNameForCopy} in Your City →
          </button>
        </div>
      </motion.section>
      )}

      {showPortfolios && (
      <motion.section
        className="home-portfolio work-portfolio"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.2)}
      >
        <div className="home-portfolio-header">
          <div className="home-portfolio-header-content">
            <RichText as="p" className="home-portfolio-label" content={resolvedService.portfolioLabel} />
            <RichText as="h2" className="home-portfolio-title" content={resolvedService.portfolioTitle} />
          </div>
          {!isSingle && (
            <div className="home-portfolio-navigation desktop">
              <button className="home-nav-button" onClick={() => scroll('left')} aria-label="Previous">
                ←
              </button>
              <button className="home-nav-button" onClick={() => scroll('right')} aria-label="Next">
                →
              </button>
            </div>
          )}
        </div>
        <div
          className={`home-portfolio-slider${isSingle ? ' single' : ''}`}
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {portfolioItems.map((project) => (
            <div
              key={project.slug || project.id}
              className="home-portfolio-card"
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="home-portfolio-image">
                <img src={project.image || undefined} alt={project.name} onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect width="400" height="500" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999"%3E' + project.name + '%3C/text%3E%3C/svg%3E';
                }} />
              </div>
              <div className="home-portfolio-overlay">
                <div className="home-portfolio-overlay-content">
                  <RichText as="h3" className="home-portfolio-project-name" content={project.name} />
                  <RichText as="p" className="home-portfolio-project-description" content={project.summary || project.description} />
                </div>
                <button
                  className="home-portfolio-view-button"
                  onClick={() => router.push(`/project/${project.slug || project.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        {!isSingle && (
          <div className="home-portfolio-navigation mobile">
            <button className="home-nav-button" onClick={() => scroll('left')} aria-label="Previous">
              ←
            </button>
            <button className="home-nav-button" onClick={() => scroll('right')} aria-label="Next">
              →
            </button>
          </div>
        )}
      </motion.section>
      )}

      {showTestimonials && (
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.25)}
      >
        <Testimonials pagePath={servicePagePath} initialTestimonials={initialTestimonials} initialIsFallback={initialTestimonialsIsFallback} />
      </motion.div>
      )}

      {showFaqs && hasFaqs && (
        <motion.section
          className="faq-section"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition(0.3)}
        >
          <div className="faq-container">
            <div className="faq-header">
              <p className="faq-label">FAQs</p>
              <h2 className="faq-title">Answers to common questions</h2>
            </div>
            <div className="faq-list">
              {faqsToRender.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div className={`faq-item${isOpen ? ' open' : ''}`} key={`${faq.question || 'faq'}-${index}`}>
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-icon" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    <div className={`faq-answer${isOpen ? ' open' : ''}`}>
                      <RichText as="div" className="faq-answer-content" content={faq.answer} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      <motion.section
        className="cta-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition(0.35)}
      >
        <div className="cta-container">
          <p className="cta-label">Have questions or need more information?</p>
          <h2 className="cta-title">Schedule a call and let’s turn your ideas into live products.</h2>
            <button className="cta-button" onClick={() => router.push('/contact')}>Contact Us</button>
        </div>
      </motion.section>

      <RequestQuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} services={initialService ? [initialService] : []} defaultServiceAlias={initialService?.alias || ''} />

      {hoveredTool && (
        <div
          className="tool-popup"
          style={{ top: toolPopupPos.top, left: toolPopupPos.left }}
          onMouseEnter={handlePopupEnter}
          onMouseLeave={handlePopupLeave}
        >
          <div className="tool-popup-header">
            <div className="tool-popup-title">{hoveredTool.name}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
