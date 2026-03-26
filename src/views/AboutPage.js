'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Team from '../components/Team';
import { useResponsiveSectionVariants } from '../lib/useResponsiveSectionVariants';

const sectionTransition = (delay = 0) => ({
  duration: 0.5,
  ease: 'easeOut',
  delay
});

const AboutPage = () => {
  const router = useRouter();
  const sectionVariants = useResponsiveSectionVariants();

  return (
    <>
      <main className="about-page">
        <motion.section
          className="about-hero"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={sectionTransition(0)}
        >
          <div className="about-hero-inner">
            <div className="about-hero-text">
              <p className="about-hero-label">ABOUT US</p>
              <h1 className="about-hero-title">We build and scale digital products end-to-end</h1>
              <p className="about-hero-description">
                We craft mobile apps, WordPress sites, custom web apps, AI integrations, IoT solutions, and full-funnel digital marketing and SEO. From discovery and UX to engineering, cloud, and analytics, our team ships reliable products, modernizes stacks, and drives measurable growth across every channel. We pair transparent communication, sprint-based delivery, and iterative optimization to reduce risk, improve performance, and keep your roadmap moving forward.
              </p>
              <button className="about-hero-cta">Hire Us</button>
            </div>
            <div className="about-hero-image-wrapper">
              <img src="/images/IfStatic_About_Us.png" alt="Team collaborating" className="about-hero-image" />
            </div>
          </div>
        </motion.section>
        
        <motion.section
          className="about-vision"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition(0.05)}
        >
          <div className="about-vision-inner">
            <p className="about-vision-label">IFSTATIC TECHNOLOGIES</p>
            <h2 className="about-vision-title">Your Vision, Our Mission</h2>
            <p className="about-vision-description">
              We partner with you from strategy to shipping—designing, engineering, and optimizing reliable digital experiences that elevate customer journeys, modernize your stack, and deliver measurable growth. We align product thinking with scalable architecture, analytics, and automation, ensuring every release is observable, secure, and ROI-focused. Whether launching a new product or optimizing an existing one, we iterate with transparent communication and predictable delivery so your vision becomes a tangible, market-ready outcome. Our multidisciplinary team collaborates closely with stakeholders to reduce risk, accelerate timelines, and sustain long-term growth. From discovery workshops to continuous improvement, we stay accountable to clear milestones, validated learning, and performance metrics that keep your roadmap moving forward.
            </p>
          </div>
        </motion.section>

        <motion.section
          className="about-stats"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition(0.1)}
        >
          <div className="about-stats-inner">
            <div className="stat-item">
              <h3 className="stat-number">100+</h3>
              <p className="stat-label">Projects Completed</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">92+</h3>
              <p className="stat-label">Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">10+</h3>
              <p className="stat-label">Team Members</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">5+</h3>
              <p className="stat-label">Years of Experience</p>
            </div>
          </div>
        </motion.section>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition(0.15)}
        >
          <Team />
        </motion.div>

        <motion.section
          className="cta-section"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition(0.2)}
        >
          <div className="cta-container">
            <p className="cta-label">Have questions or need more information?</p>
            <h2 className="cta-title">Schedule a call and let’s turn your ideas into live products.</h2>
            <button className="cta-button" onClick={() => router.push('/contact')}>Contact Us</button>
          </div>
        </motion.section>
      </main>
    </>
  );
};

export default AboutPage;
