import React from 'react';

const About = () => {
  return (
    <section className="about">
      <div className="about-container">
        <div className="about-content">
          <p className="about-label">ABOUT US</p>
          <h2 className="about-title">Building Digital Experiences That Grow Your Business</h2>
          <div className="about-description">
            <p>
              We are a software development company crafting mobile apps, WordPress sites, bespoke web apps,
              AI integrations, IoT-driven solutions, and full-funnel digital marketing and SEO services.
            </p>
            <p>
              From strategy and design to engineering and go-live, we help brands launch reliable products,
              modernize tech stacks, and drive measurable growth across every digital touchpoint.
            </p>
          </div>
        </div>
        
        <div className="about-illustration">
          <div className="illustration-bg">
            <svg viewBox="0 0 400 350" className="team-illustration">
              {/* Background elements */}
              <rect x="30" y="40" width="100" height="140" rx="8" fill="#f0f0f0" opacity="0.5"/>
              <rect x="270" y="30" width="90" height="150" rx="8" fill="#e8e8e8" opacity="0.3"/>
              <circle cx="350" cy="200" r="80" fill="#f5f5f5" opacity="0.4"/>
              
              {/* Person 1 - Left */}
              <g className="person person-1">
                {/* Body */}
                <ellipse cx="120" cy="280" rx="25" ry="15" fill="#2c3e50"/>
                <rect x="95" y="200" width="50" height="80" rx="25" fill="#CB356B"/>
                {/* Head */}
                <circle cx="120" cy="170" r="28" fill="#f4c2c2"/>
                {/* Hair */}
                <path d="M 95 165 Q 120 145 145 165" fill="#2c3e50"/>
                {/* Arms */}
                <rect x="75" y="210" width="15" height="50" rx="7" fill="#CB356B" transform="rotate(-20 82 210)"/>
                <rect x="130" y="210" width="15" height="50" rx="7" fill="#CB356B" transform="rotate(20 137 210)"/>
                {/* Hands reaching */}
                <circle cx="75" cy="250" r="8" fill="#f4c2c2"/>
                <circle cx="165" cy="250" r="8" fill="#f4c2c2"/>
              </g>
              
              {/* Person 2 - Center */}
              <g className="person person-2">
                {/* Body */}
                <ellipse cx="200" cy="280" rx="25" ry="15" fill="#2c3e50"/>
                <rect x="175" y="200" width="50" height="80" rx="25" fill="#8B2F5A"/>
                {/* Head */}
                <circle cx="200" cy="170" r="28" fill="#f4c2c2"/>
                {/* Hair */}
                <ellipse cx="200" cy="160" rx="30" ry="25" fill="#5c3317"/>
                {/* Arms */}
                <rect x="155" y="210" width="15" height="50" rx="7" fill="#8B2F5A" transform="rotate(-30 162 210)"/>
                <rect x="210" y="210" width="15" height="50" rx="7" fill="#8B2F5A" transform="rotate(30 217 210)"/>
                {/* Hands */}
                <circle cx="145" cy="245" r="8" fill="#f4c2c2"/>
                <circle cx="245" cy="245" r="8" fill="#f4c2c2"/>
              </g>
              
              {/* Person 3 - Right */}
              <g className="person person-3">
                {/* Body */}
                <ellipse cx="280" cy="280" rx="25" ry="15" fill="#2c3e50"/>
                <rect x="255" y="200" width="50" height="80" rx="25" fill="#2c3e50"/>
                {/* Head */}
                <circle cx="280" cy="170" r="28" fill="#f4c2c2"/>
                {/* Hair */}
                <path d="M 260 175 Q 280 150 300 175 L 300 165 Q 280 140 260 165 Z" fill="#2c3e50"/>
                {/* Arms */}
                <rect x="235" y="210" width="15" height="50" rx="7" fill="#2c3e50" transform="rotate(-35 242 210)"/>
                <rect x="290" y="210" width="15" height="50" rx="7" fill="#2c3e50" transform="rotate(25 297 210)"/>
                {/* Hands */}
                <circle cx="225" cy="240" r="8" fill="#f4c2c2"/>
                <circle cx="315" cy="250" r="8" fill="#f4c2c2"/>
              </g>
              
              {/* Connection lines between hands */}
              <line x1="165" y1="250" x2="145" y2="245" stroke="#CB356B" strokeWidth="4" strokeLinecap="round"/>
              <line x1="245" y1="245" x2="225" y2="240" stroke="#8B2F5A" strokeWidth="4" strokeLinecap="round"/>
              
              {/* Decorative elements */}
              <circle cx="60" cy="120" r="5" fill="#CB356B" opacity="0.6"/>
              <circle cx="340" cy="280" r="6" fill="#CB356B" opacity="0.5"/>
              <rect x="320" y="100" width="8" height="8" fill="#CB356B" opacity="0.4" transform="rotate(45 324 104)"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
