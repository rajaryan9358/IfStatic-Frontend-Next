"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import RichText from './RichText';

const Testimonials = ({ pagePath = '/', initialTestimonials = null, initialIsFallback = false }) => {
  const testimonials = Array.isArray(initialTestimonials) ? initialTestimonials : [];
  const isFallback = Boolean(initialIsFallback);
  const isLoading = false;
  const error = '';

  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shouldLoop = testimonials.length > 1;
  const sliderTestimonials = useMemo(
    () => (shouldLoop ? [...testimonials, ...testimonials, ...testimonials] : testimonials),
    [shouldLoop, testimonials]
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !shouldLoop) {
      return undefined;
    }

    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      return undefined;
    }

    const cardWidth = 380 + 32;
    const totalWidth = cardWidth * testimonials.length;
    container.scrollLeft = totalWidth;

    let scrollInterval = null;
    let isPaused = false;

    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    scrollInterval = setInterval(() => {
      if (!isPaused && container) {
        container.scrollLeft += 1;

        if (container.scrollLeft >= totalWidth * 2) {
          container.scrollLeft = totalWidth;
        }
      }
    }, 20);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shouldLoop, testimonials.length, pagePath]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile || testimonials.length === 0) return undefined;

    const handleScroll = () => {
      const cards = container.querySelectorAll('.testimonial-card');
      if (!cards.length) return;
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap =
        parseFloat(getComputedStyle(container).columnGap || getComputedStyle(container).gap || '0') || 0;
      const step = cardWidth + gap;
      const rawIndex = Math.round(container.scrollLeft / step);
      setCurrentIndex(((rawIndex % testimonials.length) + testimonials.length) % testimonials.length);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [testimonials.length, shouldLoop]);

  const handleDotClick = (index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('.testimonial-card');
    const target = cards[index];
    if (target) {
      container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
  };

  const renderStars = (rating = 0) =>
    [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <p className="testimonials-label">TESTIMONIALS</p>
          <h2 className="testimonials-title">What Customers are saying...</h2>
        </div>

        {error && <p className="testimonials-status warning">{error}</p>}
        {isLoading && <p className="testimonials-status">Loading testimonials...</p>}
        {!isLoading && !error && isFallback && testimonials.length > 0 && (
          <p className="testimonials-status muted">Showing default testimonials until new entries are published.</p>
        )}
        {!isLoading && !testimonials.length && !error && (
          <p className="testimonials-status">No testimonials for this page yet.</p>
        )}

        {testimonials.length > 0 && (
          <div className="testimonials-slider-wrapper">
            <div className="testimonials-slider" ref={scrollContainerRef}>
              {sliderTestimonials.map((testimonial, index) => (
                <article key={`${testimonial.id || index}-${index}`} className="testimonial-card">
                  <div className="testimonial-project">
                    <div>
                      <p className="testimonial-project-name">{testimonial.project}</p>
                      <span className="testimonial-budget">{testimonial.budget}</span>
                    </div>
                    <div className="testimonial-meta">
                      <div className="testimonial-rating">{renderStars(testimonial.rating)}</div>
                      <span className="testimonial-timeframe">{testimonial.timeframe}</span>
                    </div>
                  </div>

                  <RichText as="p" className="testimonial-text" content={testimonial.testimonial} />

                  {Array.isArray(testimonial.skills) && testimonial.skills.length > 0 && (
                    <div className="testimonial-skills">
                      {testimonial.skills.map((skill, skillIndex) => (
                        <span key={`${testimonial.id || 'skill'}-${skillIndex}`} className="testimonial-skill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="testimonial-client">
                    <img
                      src={testimonial.image || undefined}
                      alt={testimonial.name}
                      className="testimonial-avatar"
                      onError={(e) => {
                        const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23CB356B'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' font-family='Arial' font-size='32' fill='white'%3E${(
                          testimonial.name || 'T'
                        ).charAt(0)}%3C/text%3E%3C/svg%3E`;
                        e.target.src = fallbackSvg;
                      }}
                    />
                    <div className="testimonial-client-info">
                      <h3 className="testimonial-name">{testimonial.name}</h3>
                      <p className="testimonial-handle">{testimonial.handle}</p>
                      <p className="testimonial-location">{testimonial.location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {testimonials.length > 1 && (
              <div className="testimonials-dots">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`testimonials-dot ${currentIndex === idx ? 'active' : ''}`}
                    onClick={() => handleDotClick(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
