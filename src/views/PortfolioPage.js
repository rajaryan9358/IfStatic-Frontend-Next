"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RichText from '../components/RichText';
import { useResponsiveSectionVariants } from '../lib/useResponsiveSectionVariants';

const sectionTransition = (delay = 0) => ({
  duration: 0.5,
  ease: 'easeOut',
  delay,
});

const normalizeServiceSlug = (value = '') =>
  decodeURIComponent(String(value))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');

const PortfolioPage = ({
  initialServices = [],
  initialPortfolios = [],
  initialPortfoliosIsFallback = false,
  serviceSlug = '',
}) => {
  const router = useRouter();
  const sectionVariants = useResponsiveSectionVariants();

  const normalizedServiceSlugFromUrl = useMemo(
    () => normalizeServiceSlug(serviceSlug || ''),
    [serviceSlug]
  );

  const services = Array.isArray(initialServices) ? initialServices : [];
  const portfolios = Array.isArray(initialPortfolios) ? initialPortfolios : [];

  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const normalizedActiveTab = useMemo(() => normalizeServiceSlug(activeTab), [activeTab]);

  useEffect(() => {
    if (!normalizedServiceSlugFromUrl) {
      setActiveTab('all');
      return;
    }

    const matched = services.find(
      (svc) => normalizeServiceSlug(svc.alias) === normalizedServiceSlugFromUrl
    );

    setActiveTab(matched ? normalizedServiceSlugFromUrl : 'all');
  }, [normalizedServiceSlugFromUrl, services]);

  const filteredPortfolios = useMemo(() => {
    if (normalizedActiveTab === 'all') return portfolios;
    return portfolios.filter(
      (p) => normalizeServiceSlug(p.serviceAlias) === normalizedActiveTab
    );
  }, [portfolios, normalizedActiveTab]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProjects = filteredPortfolios.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredPortfolios.length / itemsPerPage) || 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const handleTabChange = (tab) => {
    const next = normalizeServiceSlug(tab);
    setActiveTab(next);

    if (next === 'all') {
      router.push('/portfolio');
      return;
    }

    router.push(`/portfolio/${next}`);
  };

  const serviceLookup = useMemo(() => {
    const map = new Map();
    services.forEach((svc) => {
      map.set(normalizeServiceSlug(svc.alias), svc);
    });
    return map;
  }, [services]);

  const tabConfig = useMemo(
    () => [
      { label: 'All', value: 'all' },
      ...services.map((svc) => ({
        label: svc.name,
        value: normalizeServiceSlug(svc.alias),
      })),
    ],
    [services]
  );

  return (
    <>
      <main className="portfolio-page">
        <motion.section
          className="portfolio-header"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={sectionTransition(0)}
        >
          <div className="portfolio-header-inner">
            <h1 className="portfolio-title">Our Work Portfolio</h1>
            <p className="portfolio-description">
              Our mission is to make web design easy, so you can focus on building your brand. We're always looking for our next portfolio piece which means we're constantly working hard to improve our craft. Some of the esteemed projects we worked upon, to give you a glimpse of the way we work.
            </p>
            
          </div>
        </motion.section>

        <motion.section
          className="portfolio-content"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition(0.05)}
        >
          <div className="portfolio-content-inner">
            <motion.div
              className="portfolio-tabs"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={sectionTransition(0.1)}
            >
              {tabConfig.map((tab) => (
                <button
                  key={tab.value}
                  className={`tab-button ${normalizedActiveTab === tab.value ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {!displayedProjects.length ? (
              <motion.div
                className="portfolio-empty"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={sectionTransition(0.15)}
              >
                No case studies available for this service yet.
              </motion.div>
            ) : (
              <motion.div
                className="portfolio-grid"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={sectionTransition(0.15)}
              >
                {displayedProjects.map((project) => {
                  const service = serviceLookup.get(normalizeServiceSlug(project.serviceAlias));
                  return (
                    <div
                      key={project.slug || project.id}
                      className="portfolio-card"
                      onClick={() => router.push(`/project/${project.slug || project.id}`)}
                    >
                      <div className="portfolio-card-image">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.name}
                            onError={(e) => {
                              e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='280'%3E%3Crect width='400' height='280' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%23999'%3E${encodeURIComponent(project.name)}%3C/text%3E%3C/svg%3E`;
                            }}
                          />
                        ) : (
                          <div className="portfolio-card-image-placeholder">{project.name}</div>
                        )}
                      </div>
                      <div className="portfolio-card-content">
                        <div className="portfolio-card-meta">
                          <span className="portfolio-card-category">
                            {project.heroCategory || service?.name || 'Case Study'}
                          </span>
                          <span className="portfolio-card-company">{project.company || 'Client project'}</span>
                        </div>
                        <RichText as="h3" className="portfolio-card-title" content={project.name} />
                        <RichText
                          as="p"
                          className="portfolio-card-description"
                          content={project.summary || project.description}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {totalPages > 1 && displayedProjects.length > 0 && (
              <motion.div
                className="portfolio-pagination"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={sectionTransition(0.2)}
              >
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>
    </>
  );
};

export default PortfolioPage;
