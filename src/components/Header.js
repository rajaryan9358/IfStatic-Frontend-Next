'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

const Header = ({ services = [] }) => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(getIsMobile);
  const dropdownRef = useRef(null);
  const pathname = usePathname() || '';
  const isServicesPage = pathname.startsWith('/services');
  const isHomePage = pathname === '/';
  const isContactPage = pathname === '/contact';
  const isAboutPage = pathname === '/about';
  const isPortfolioPage =
    pathname === '/portfolio' || pathname.startsWith('/portfolio/') || pathname.startsWith('/project/');
  const isBlogsPage =
    pathname === '/blogs' || pathname.startsWith('/blogs/') || pathname.startsWith('/blog/');

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setIsMobileView(getIsMobile());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
    };
    const handleVisibilityOrBlur = () => setIsServicesOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    window.addEventListener('blur', handleVisibilityOrBlur);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
      window.removeEventListener('blur', handleVisibilityOrBlur);
    };
  }, []);

  const handleServicesKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsServicesOpen(true);
    }
  };

  const handleNavItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleServicesClick = (e) => {
    e.preventDefault();
    if (isMobileView) {
      if (!isServicesOpen) {
        setIsServicesOpen(true);
        return;
      }
      setIsServicesOpen(false);
      return;
    }
    setIsServicesOpen((prev) => !prev);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link href="/" className="logo" onClick={handleNavItemClick}>
          <img src="/logo_secondary.png" alt="IFSTATIC Technologies" className="logo-image" />
        </Link>

        <button
          className="hamburger-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          type="button"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link
            href="/"
            className={`nav-link ${isHomePage && !isContactPage ? 'active' : ''}`}
            onClick={handleNavItemClick}
          >
            Home
          </Link>
          <div
            ref={dropdownRef}
            className="nav-dropdown"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button
              type="button"
              className={`nav-link dropdown-toggle ${isServicesPage && !isContactPage ? 'active' : ''}`}
              onClick={handleServicesClick}
              onKeyDown={handleServicesKeyDown}
            >
              Services
              <span className="dropdown-arrow">▼</span>
            </button>
            {isServicesOpen && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
                onClick={(e) => e.stopPropagation()}
              >
                {services.map((service) => (
                  <Link
                    key={service.id || service.alias}
                    href={`/services/${service.alias}`}
                    className="dropdown-item"
                    onClick={() => {
                      setIsServicesOpen(false);
                      handleNavItemClick();
                    }}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/portfolio"
            className={`nav-link ${isPortfolioPage && !isContactPage ? 'active' : ''}`}
            onClick={handleNavItemClick}
          >
            Portfolio
          </Link>
          <Link
            href="/blogs"
            className={`nav-link ${isBlogsPage && !isContactPage ? 'active' : ''}`}
            onClick={handleNavItemClick}
          >
            Blogs
          </Link>
          <Link
            href="/about"
            className={`nav-link ${isAboutPage && !isContactPage ? 'active' : ''}`}
            onClick={handleNavItemClick}
          >
            About us
          </Link>
          <Link href="/contact" className="nav-link mobile-contact" onClick={handleNavItemClick}>
            Contact
          </Link>
        </nav>
        <Link href="/contact" className="contact-btn desktop-only" onClick={handleNavItemClick}>
          Contact
        </Link>
      </div>
    </header>
  );
};

export default Header;
