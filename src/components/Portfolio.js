"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import RichText from './RichText';

const getSliderMetrics = (container) => {
  if (!container) {
    return { cardWidth: 0, gap: 0, positions: [] };
  }

  const cards = Array.from(container.querySelectorAll('.home-portfolio-card'));
  const positions = cards.map((card) => card.offsetLeft);
  const firstCard = cards[0] || null;
  const cardWidth = firstCard?.getBoundingClientRect().width || 0;
  const styles = window.getComputedStyle(container);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;

  return { cardWidth, gap, positions };
};

const getNearestIndex = (container) => {
  const { positions } = getSliderMetrics(container);
  if (!positions.length) return 0;

  return positions.reduce((closestIndex, position, index) => {
    const currentDistance = Math.abs(position - container.scrollLeft);
    const closestDistance = Math.abs(positions[closestIndex] - container.scrollLeft);
    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);
};

const Portfolio = ({ initialPortfolios = null, initialIsFallback = false }) => {
  const router = useRouter();
  const portfolios = Array.isArray(initialPortfolios) ? initialPortfolios : [];
  const isLoading = false;
  const error = '';

  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const autoScrollRef = useRef(null);

  const handleMouseDown = (e) => {
    stopAutoScroll();
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (!container) return;
    const newIndex = getNearestIndex(container);
    scrollToIndex(newIndex);
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
    if (!container) return;
    const newIndex = getNearestIndex(container);
    scrollToIndex(newIndex);
    setCurrentIndex(newIndex);
    startAutoScroll();
  };

  const scroll = (dir) => {
    if (!scrollContainerRef.current || !portfolios.length) {
      return;
    }
    stopAutoScroll();
    const container = scrollContainerRef.current;
    const { positions } = getSliderMetrics(container);
    if (!positions.length) return;

    let newIndex;
    if (dir === 'left') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      const lastIndex = Math.max(0, portfolios.length - 1);
      newIndex = Math.min(lastIndex, currentIndex + 1);
    }

    scrollToIndex(newIndex);
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
    const { positions } = getSliderMetrics(container);
    const scrollAmount = positions[index] ?? 0;
    container.scrollTo({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const startAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    if (portfolios.length < 2) {
      return;
    }
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        let nextDirection = direction;
        if (prevIndex === portfolios.length - 1) {
          nextDirection = -1;
        } else if (prevIndex === 0) {
          nextDirection = 1;
        }
        if (nextDirection !== direction) {
          setDirection(nextDirection);
        }
        const nextIndex = Math.max(0, Math.min(portfolios.length - 1, prevIndex + nextDirection));
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

  useEffect(() => {
    startAutoScroll();

    return () => {
      stopAutoScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolios.length]);

  const visiblePortfolios = portfolios;
  const isSingle = visiblePortfolios.length === 1;

  return (
    <section className="home-portfolio">
      <div className="home-portfolio-header">
        <div className="home-portfolio-header-content">
          <p className="home-portfolio-label">PORTFOLIO</p>
          <h2 className="home-portfolio-title">Our Portfolio</h2>
          {error && <p className="home-portfolio-status warning">{error}</p>}
          {isLoading && <p className="home-portfolio-status">Loading projects…</p>}
          {!isLoading && !error && initialIsFallback && visiblePortfolios.length > 0 && (
            <p className="home-portfolio-status muted">Showing sample projects until new case studies are published.</p>
          )}
        </div>
        {!isSingle && (
          <div className="home-portfolio-navigation desktop">
            <button className="home-nav-button" onClick={() => scroll('left')} aria-label="Previous">
              <span className="home-nav-button__icon">←</span>
            </button>
            <button className="home-nav-button" onClick={() => scroll('right')} aria-label="Next">
              <span className="home-nav-button__icon">→</span>
            </button>
          </div>
        )}
      </div>

      {!visiblePortfolios.length && !isLoading ? (
        <p className="home-portfolio-status home-portfolio-empty">No portfolio items available yet.</p>
      ) : (
        <>
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
            {visiblePortfolios.map((project) => (
              <div
                key={project.slug || project.id}
                className="home-portfolio-card"
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="home-portfolio-image">
                  <img
                    src={project.image || '/sample/placeholder-portfolio.jpg'}
                    alt={project.name}
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect width="400" height="500" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999"%3E' +
                        project.name +
                        '%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="home-portfolio-overlay">
                  <div className="home-portfolio-overlay-content">
                    <RichText as="h3" className="home-portfolio-project-name" content={project.name} />
                    <RichText
                      as="p"
                      className="home-portfolio-project-description"
                      content={project.summary || project.description}
                    />
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
                <span className="home-nav-button__icon">←</span>
              </button>
              <button className="home-nav-button" onClick={() => scroll('right')} aria-label="Next">
                <span className="home-nav-button__icon">→</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Portfolio;
