'use client';

import React from 'react';
import Link from 'next/link';

const Footer = ({ services = [] }) => {
  const primaryServiceAlias = services[0]?.alias || 'app-development';

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-branding">
            <img src="/logo_secondary.png" alt="IfStatic Technologies" className="footer-logo" />
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-links-container">
            <div className="footer-column company">
              <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/services">Our Services</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/portfolio">Portfolio</Link></li>
                <li><Link href="/blogs">Blogs</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-column services">
            <h3 className="footer-heading">Our Services</h3>
            <ul className="footer-links">
                <li>
                  <Link href="/services">All Services</Link>
                </li>
                {services.map((service) => (
                  <li key={service.id || service.alias}>
                    <Link href={`/services/${service.alias}`}>{service.name}</Link>
                  </li>
                ))}
            </ul>
          </div>

          <div className="footer-column follow-us">
            <h3 className="footer-heading">Follow us</h3>
            <ul className="footer-links">
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://behance.net" target="_blank" rel="noopener noreferrer">Behance</a></li>
            </ul>
          </div>

          <div className="footer-column contact-us">
            <h3 className="footer-heading">Contact us</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <div className="footer-contact-icon" style={{ color: '#CB356B' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="footer-contact-label">Email</p>
                  <p className="footer-contact-value">
                    <a href="mailto:contact@ifstatic.com" style={{ color: '#000', textDecoration: 'none' }}>
                      contact@ifstatic.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon" style={{ color: '#CB356B' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.08 4.18 2 2 0 014.06 2h3a2 2 0 012 1.72c.12.86.36 1.7.7 2.49a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.79.34 1.63.58 2.49.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="footer-contact-label">Mobile</p>
                  <p className="footer-contact-value">
                    <a href="tel:+918076689373" style={{ color: '#000', textDecoration: 'none' }}>+91 8076689373</a>
                  </p>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon" style={{ color: '#CB356B' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="footer-contact-label">Address</p>
                  <p className="footer-contact-value">Centurian Park O2 Valley, Greater Noida West, UP, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">Copyright © 2025 IfStatic Technologies. All Rights Reserved.</p>
            <div className="footer-legal">
              <Link href="/terms-and-conditions">Terms & Conditions</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
