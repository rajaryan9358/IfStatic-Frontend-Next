"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import RequestQuoteModal from '../components/RequestQuoteModal';
import { shapePortfolio } from '../hooks/portfolioHelpers';
import RichText from '../components/RichText';
import './ProjectDetails.css';

const defaultGallery = ['/sample/2.png', '/sample/3.png', '/sample/4.png'];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const sectionTransition = (delay = 0) => ({
  duration: 0.5,
  ease: 'easeOut',
  delay
});

const ProjectDetails = ({ slug = '', initialPortfolio = null, initialMeta = null, initialServices = [], initialTestimonials = null, initialTestimonialsIsFallback = false }) => {
  const router = useRouter();
  const pathname = usePathname();

  const slugFromUrl = React.useMemo(() => (
    slug || pathname?.split('/')?.filter(Boolean).pop() || ''
  ), [slug, pathname]);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hoveredTool, setHoveredTool] = React.useState(null);
  const [toolPopupPos, setToolPopupPos] = React.useState({ top: 0, left: 0 });
  const hideToolTimerRef = React.useRef(null);
  const scrollContainerRef = React.useRef(null);
  const detailPagePath = slugFromUrl ? `/portfolio/${slugFromUrl}` : '';

  const project = React.useMemo(() => {
    if (!initialPortfolio) return null;
    const shaped = shapePortfolio(initialPortfolio);
    const meta = initialMeta && typeof initialMeta === 'object' ? initialMeta : {};
    return {
      ...shaped,
      metaTitle:
        meta.metaTitle ??
        meta.meta_title ??
        shaped.metaTitle ??
        shaped.meta_title ??
        '',
      metaDescription:
        meta.metaDescription ??
        meta.meta_description ??
        shaped.metaDescription ??
        shaped.meta_description ??
        '',
      metaSchema:
        meta.metaSchema ??
        meta.meta_schema ??
        shaped.metaSchema ??
        shaped.meta_schema ??
        ''
    };
  }, [initialPortfolio, initialMeta]);



  const testimonials = Array.isArray(initialTestimonials) ? initialTestimonials : [];
  const isTestimonialsLoading = false;
  const testimonialsError = '';
  const isTestimonialsFallback = Boolean(initialTestimonialsIsFallback);

  const isLoading = false;
  const error = '';
  const isFallback = false;

  const galleryImages = project?.gallery?.length ? project.gallery : defaultGallery;
  const heroLabel = project?.heroCategory || project?.serviceName || 'PROJECT';
  const heroTitle = project?.heroTitle || project?.name || 'Case Study';
  const projectName = project?.name || heroTitle;
  const heroSubtitle = project?.heroSubtitle || project?.description || project?.summary || '';
  const downloadTitle = project?.downloadTitle || project?.heroTagline || projectName;
  const downloadDescription = project?.downloadDescription || project?.summary || project?.description || '';
  const showDownloadSection = project?.showDownloadSection !== false;
  const ctaTitle = project?.ctaTitle || `Let's build the next ${projectName} together.`;
  const heroImage = project?.image || galleryImages[0] || '/sample/2.png';
  const features = project?.features || [];
  const techStack = project?.techStack || [];
  const ctaButtons = project?.ctaButtons || [];
  const websiteUrl = project?.websiteUrl || '';
  const company = project?.company || '';
  const feedbacksPerSlide = 3;
  const totalSlides = testimonials.length ? Math.ceil(testimonials.length / feedbacksPerSlide) : 0;
  const [isGalleryPaused, setIsGalleryPaused] = React.useState(false);
  React.useEffect(() => {
    setCurrentSlide(0);
  }, [testimonials.length]);

  React.useEffect(() => {
    if (!testimonials.length || !scrollContainerRef.current) return undefined;

    const scrollContainer = scrollContainerRef.current;
    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const slideWidth = scrollContainer.offsetWidth || 1;
      const newSlide = Math.round(scrollLeft / slideWidth);
      setCurrentSlide((prev) => (prev === newSlide ? prev : newSlide));
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [testimonials.length]);

  const scrollToSlide = (index) => {
    if (!scrollContainerRef.current) return;
    const slideWidth = scrollContainerRef.current.offsetWidth;
    scrollContainerRef.current.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
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
    hideToolTimerRef.current = setTimeout(() => setHoveredTool(null), 120);
  };

  const handlePopupEnter = () => clearHideToolTimer();
  const handlePopupLeave = () => setHoveredTool(null);

  if (isLoading && !project) {
    return (
      <main className="project-details-page project-details-loading">
        <p>Loading project…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="project-details-page project-details-empty">
        <motion.section
          className="project-hero"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={sectionTransition(0)}
        >
          <div className="project-hero-inner">
            <div className="project-hero-text">
              <p className="project-hero-label">PROJECT</p>
              <h1 className="project-hero-title">Case study unavailable</h1>
              <p className="project-hero-subtitle">{error || 'We could not find this project.'}</p>
              <button className="cta-button" onClick={() => router.push('/portfolio')}>Back to Portfolio</button>
            </div>
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <>
      <main className="project-details-page">
        <motion.section
          className="project-hero"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={sectionTransition(0)}
        >
          <div className="project-hero-inner">
            <div className="project-hero-text">
              <RichText as="p" className="project-hero-label" content={heroLabel} />
              <RichText as="h1" className="project-hero-title" content={heroTitle} />
              <RichText as="p" className="project-hero-subtitle" content={heroSubtitle} />
              {company && <p className="project-hero-company">Built for {company}</p>}
              {error && <p className="project-status warning">{error}</p>}
            </div>
            <div className="project-hero-image">
              <img
                src={heroImage}
                alt={projectName}
                className="project-preview-image"
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = '/sample/2.png';
                }}
              />
            </div>
          </div>
        </motion.section>

        {features.length > 0 && (
          <motion.section
            className="project-features"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.05)}
          >
            <div className="project-features-inner">
              <h2 className="features-title">Project Features</h2>
              <div className="features-list">
                {features.map((feature, index) => (
                  <div key={`${feature.title}-${index}`} className="feature-item">
                    <h3 className="feature-title">
                      <RichText as="span" className="feature-title-text" content={feature.title} />
                      <span className="feature-colon"> : </span>
                    </h3>
                    <RichText as="p" className="feature-description" content={feature.description} />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {galleryImages.length > 0 && (
          <motion.section
            className="project-gallery"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.1)}
          >
            <div className="project-gallery-inner">
              <div
                className={`gallery-scroll ${isGalleryPaused ? 'is-paused' : ''}`}
                onMouseEnter={() => setIsGalleryPaused(true)}
                onMouseLeave={() => setIsGalleryPaused(false)}
              >
                <div className={`gallery-track ${isGalleryPaused ? 'paused' : ''}`}>
                  <div className="gallery-set">
                    {galleryImages.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`${projectName} screenshot ${index + 1}`}
                        className="gallery-image"
                        onError={(event) => {
                          event.currentTarget.src = '/sample/2.png';
                        }}
                      />
                    ))}
                  </div>
                  <div className="gallery-set">
                    {galleryImages.map((image, index) => (
                      <img
                        key={`duplicate-${image}-${index}`}
                        src={image}
                        alt={`${projectName} screenshot ${index + 1}`}
                        className="gallery-image"
                        onError={(event) => {
                          event.currentTarget.src = '/sample/2.png';
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {techStack.length > 0 && (
          <motion.section
            className="project-tech-stack"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.15)}
          >
            <div className="project-tech-stack-inner">
              <p className="tech-stack-label">TOOLS</p>
              <h2 className="tech-stack-title">Techs we used</h2>
              <div className="tech-stack-grid">
                {techStack.map((tech, index) => (
                  <div
                    key={`${tech.name}-${index}`}
                    className="tech-item"
                    tabIndex={0}
                    aria-label={tech.name}
                    onMouseEnter={(e) => handleToolEnter(tech, e)}
                    onMouseLeave={handleToolLeave}
                  >
                    {tech.icon ? (
                      <img src={tech.icon} alt={tech.name} className="tech-icon" />
                    ) : (
                      <span className="tech-placeholder">{tech.name?.charAt(0) || '?'}</span>
                    )}
                    {/* removed tool name display */}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {(testimonials.length > 0 || isTestimonialsLoading || testimonialsError) && (
          <motion.section
            className="project-feedback"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.2)}
          >
            <div className="project-feedback-inner">
              <p className="feedback-label">FEEDBACK</p>
              <h2 className="feedback-title">Clients & Users Feedback</h2>
              {testimonialsError && <p className="project-feedback-status warning">{testimonialsError}</p>}
              {isTestimonialsLoading && !testimonials.length && (
                <p className="project-feedback-status">Loading testimonials…</p>
              )}
              {!isTestimonialsLoading && !testimonialsError && testimonials.length === 0 && (
                <p className="project-feedback-status">No testimonials for this project yet.</p>
              )}
              {!isTestimonialsLoading && !testimonialsError && isTestimonialsFallback && testimonials.length > 0 && (
                <p className="project-feedback-status muted">Showing shared testimonials until this case study gets its own.</p>
              )}
              {testimonials.length > 0 && (
                <>
                  <div className="feedback-scroll-container" ref={scrollContainerRef}>
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="feedback-page">
                        <div className="feedback-grid">
                          {testimonials
                            .slice(slideIndex * feedbacksPerSlide, (slideIndex + 1) * feedbacksPerSlide)
                            .map((feedback, index) => (
                              <div key={`${feedback.id || feedback.name}-${index}`} className="feedback-card">
                                <div className="feedback-header">
                                  <img
                                    src={feedback.image || '/sample/2.png'}
                                    alt={feedback.name}
                                    className="feedback-avatar"
                                    onError={(event) => {
                                      // eslint-disable-next-line no-param-reassign
                                      event.currentTarget.src = '/sample/2.png';
                                    }}
                                  />
                                  <div className="feedback-user">
                                    <h3 className="feedback-name">{feedback.name}</h3>
                                    <p className="feedback-company">{feedback.company || feedback.handle || ''}</p>
                                    <div className="feedback-rating">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`star ${i < (feedback.rating || 0) ? 'filled' : ''}`}>★</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <RichText as="p" className="feedback-text" content={feedback.testimonial} />
                                {feedback.skills?.length > 0 && (
                                  <div className="feedback-skills">
                                    {feedback.skills.map((skill, skillIndex) => (
                                      <span key={`${feedback.id || 'skill'}-${skillIndex}`} className="feedback-skill">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="feedback-footer">
                                  <span className="feedback-project">{feedback.project}</span>
                                  {feedback.timeframe && <span className="feedback-timeframe">{feedback.timeframe}</span>}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalSlides > 1 && (
                    <div className="feedback-indicators">
                      {[...Array(totalSlides)].map((_, index) => (
                        <button
                          key={index}
                          className={`indicator ${index === currentSlide ? 'active' : ''}`}
                          onClick={() => scrollToSlide(index)}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.section>
        )}

        {showDownloadSection && (
          <motion.section
            className="project-download"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.25)}
          >
          <div className="project-download-inner">
            <div className="download-decorations">
              <svg className="decoration-left" width="221" height="117" viewBox="0 0 221 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M109.014 71.9817C110.582 73.5501 111.739 75.6172 112.305 77.854C112.922 80.0806 112.963 82.4563 112.526 84.6777C112.475 84.9399 112.387 85.1919 112.325 85.4542C112.253 85.7113 112.202 85.9684 112.094 86.2306C111.904 86.75 111.724 87.2693 111.477 87.7681C111.035 88.7863 110.454 89.7427 109.826 90.6683C108.531 92.4989 106.947 94.1701 105.137 95.6048C103.337 97.0497 101.357 98.3044 99.2644 99.3637C98.2257 99.9088 97.1458 100.377 96.0506 100.819C94.9707 101.297 93.8394 101.647 92.7287 102.053C90.4713 102.752 88.1728 103.344 85.8331 103.729C83.4934 104.089 81.1332 104.367 78.7523 104.408C76.3767 104.46 73.9959 104.398 71.6253 104.136L70.7357 104.048L69.8513 103.925C69.2599 103.837 68.6686 103.765 68.0824 103.673C66.91 103.452 65.7324 103.261 64.5703 102.979C64.0972 102.871 63.6241 102.752 63.1562 102.614L61.7627 102.171L61.8501 102.187C59.0682 101.426 56.3274 100.49 53.6535 99.3842C50.9847 98.2632 48.3879 96.9777 45.8683 95.5482C40.8238 92.6995 36.1496 89.1925 31.9433 85.2176C29.5162 82.9088 27.2537 80.4303 25.1917 77.7923L22.1989 73.73L19.453 69.4929C15.9512 63.7388 13.1076 57.5837 10.8399 51.2126C6.30968 38.4549 4.05742 24.9259 3.16269 11.3557C3.06499 10.2965 3.0444 9.04686 2.96213 7.77161C2.89528 6.49636 2.79247 5.20059 2.72047 4.03846C2.55078 1.71421 2.24225 -0.0650247 1.66119 0.00182326C0.483643 0.135519 -0.333984 5.0617 0.133942 12.6001L0.370514 16.0145L0.704712 19.4289L0.874435 21.1361L1.09552 22.8381L1.54291 26.2422C2.25766 30.7622 3.04442 35.277 4.17056 39.7198C4.66934 41.9566 5.33267 44.1472 5.94972 46.3532L6.18112 47.1811L7.51807 51.2588C7.6929 51.8039 7.87291 52.349 8.08374 52.8786C8.90134 55.0178 9.65207 57.1774 10.6034 59.26C11.0662 60.3039 11.4827 61.3735 11.9763 62.4019L13.4779 65.482C16.4757 71.4624 20.1575 77.0878 24.4409 82.2711C28.7912 87.4081 33.8871 91.8818 39.4612 95.6407C45.0352 99.3894 51.1081 102.413 57.4998 104.526C63.8864 106.64 70.6123 107.823 77.3846 107.838C83.4574 107.843 89.5715 106.902 95.3152 104.814C98.1794 103.781 100.997 102.536 103.62 100.911C106.253 99.3071 108.716 97.3685 110.824 95.0288C111.868 93.8513 112.819 92.5812 113.642 91.2133C114.439 89.8301 115.102 88.3697 115.591 86.8322C116.547 83.6801 116.552 80.3377 115.74 77.2061C115.354 75.6326 114.711 74.1208 113.878 72.7067C113.482 71.9868 112.968 71.339 112.469 70.6808L111.621 69.7654C111.348 69.4518 110.999 69.2049 110.69 68.9221C108.124 66.7573 104.597 65.6055 101.182 66.1197C99.5884 66.3459 98.056 66.891 96.6933 67.6675C95.3307 68.4439 94.1171 69.4312 93.0578 70.5368C90.9444 72.7582 89.4223 75.4424 88.507 78.3271C87.602 81.2119 87.314 84.3435 87.9208 87.4082C87.998 87.7887 88.0802 88.1744 88.1933 88.5497L88.3527 89.1154L88.5481 89.645C88.8207 90.3444 89.0418 91.0694 89.3915 91.7327C89.7154 92.4115 90.0291 93.0954 90.4302 93.7279L91.001 94.6946C91.2066 95.0083 91.4278 95.3065 91.6386 95.6151C93.3612 98.0524 95.4746 100.156 97.7629 101.96C100.056 103.77 102.525 105.293 105.07 106.619C107.615 107.941 110.248 109.067 112.912 110.039L116.928 111.386L118.938 112.055C119.607 112.281 120.301 112.43 120.98 112.62C130.364 115.258 140.093 116.605 149.807 116.749C159.53 116.893 169.249 115.849 178.711 113.715C179.271 113.592 179.832 113.469 180.397 113.345C180.963 113.232 181.529 113.083 182.089 112.924C183.215 112.615 184.346 112.312 185.473 112.019C187.745 111.494 189.931 110.8 192.06 110.327L191.993 110.363C194.435 109.339 197.094 108.296 199.778 107.319C201.13 106.861 202.406 106.218 203.65 105.617C204.889 104.999 206.072 104.341 207.142 103.616C208.695 102.732 210.258 101.78 211.8 100.978C212.243 100.747 212.664 100.526 213.065 100.315C213.461 100.094 213.821 99.8573 214.166 99.6413C214.855 99.2094 215.467 98.8135 215.996 98.4535C217.056 97.7388 217.801 97.1783 218.233 96.7566C219.102 95.9133 218.727 95.6305 217.246 95.7847C216.598 95.8516 216.948 95.1729 215.241 96.0213C215.235 96.0265 215.133 96.1138 215.133 96.1138L215.169 96.0676C213.924 96.5818 212.69 97.2348 211.41 97.8981C210.104 98.5203 208.787 99.2146 207.466 99.9396C206.802 100.294 206.149 100.69 205.476 101.035C204.792 101.369 204.108 101.709 203.429 102.043C202.066 102.706 200.719 103.405 199.372 103.997C186.069 109.638 171.748 112.96 157.294 113.427C153.684 113.638 150.069 113.479 146.459 113.371L141.06 112.934C140.155 112.882 139.265 112.733 138.37 112.61L135.686 112.234C134.797 112.096 133.892 112.008 133.007 111.833L130.354 111.293C128.585 110.923 126.806 110.625 125.073 110.111C123.335 109.633 121.576 109.211 119.848 108.686L114.717 106.969C110.551 105.514 106.535 103.683 102.869 101.369C99.2027 99.0706 95.9426 96.1549 93.6749 92.6223C93.4126 92.1698 93.1298 91.7275 92.8778 91.2699L92.194 89.8661C91.8186 88.8942 91.4123 87.9224 91.2118 86.9659C90.7593 85.0222 90.821 82.9448 91.2169 80.9445C91.6335 78.939 92.4202 77.0004 93.5103 75.2727C94.6108 73.5552 96.0094 72.028 97.6498 70.9584C99.4444 69.7757 101.522 69.2101 103.543 69.4363L104.299 69.5494L105.049 69.7295L105.774 69.9866L106.139 70.11C106.258 70.1614 106.371 70.2282 106.484 70.2797L107.178 70.619L107.826 71.0458L108.155 71.2567L108.459 71.5086L109.07 72.0126C109.05 72.0126 109.029 71.9972 109.014 71.9817Z" fill="#CB356B"/>
                <path d="M220.403 95.1062C220.532 94.6023 220.702 94.0469 220.784 93.5482L220.984 92.2781C219.503 92.6123 217.92 93.0288 216.521 93.2807C216.434 93.2962 216.346 93.2396 216.259 93.219L216.269 93.2087L215.179 93.3939C214.911 93.435 214.639 93.4659 214.366 93.4813C213.101 93.5481 211.862 93.5584 210.572 93.8515C210.371 93.8927 210.032 93.8773 209.939 95.0342C209.841 96.2426 210.037 96.9625 210.433 96.942C211.379 96.8854 212.31 96.6231 213.235 96.8031C213.919 96.9317 214.603 96.9214 215.282 96.8597C215.451 96.8442 215.621 96.8237 215.791 96.8031L216.197 96.7466C216.31 96.7311 216.377 96.7209 216.428 96.726C216.516 96.7363 216.603 96.7209 216.696 96.7003C216.701 96.7826 216.665 96.9266 216.614 97.0345C216.588 97.0808 216.552 97.1271 216.516 97.158L216.5 97.1682L216.47 97.2608L216.408 97.4562L216.284 97.8521C216.12 98.3766 215.971 98.9063 215.883 99.441C215.734 100.372 215.873 101.349 215.827 102.295C215.817 102.516 215.837 102.763 215.364 102.891L215.349 102.886C215.827 103.226 214.804 103.354 215.534 103.73C215.539 103.817 215.601 103.92 215.544 103.997C215.287 104.347 215.683 104.516 217.015 104.609C217.308 104.629 217.678 104.727 217.894 104.665L217.873 104.655L217.894 104.66C218.825 104.552 218.454 104.162 218.521 103.879C218.85 102.48 219.102 101.061 219.385 99.6519L219.622 98.3509C219.663 98.1298 219.709 97.9344 219.766 97.6928C219.848 97.302 219.946 96.906 220.054 96.4946C220.172 96.0575 220.439 95.5176 220.408 95.0959L220.403 95.1062Z" fill="#CB356B"/>
              </svg>
              <svg className="decoration-right" width="221" height="117" viewBox="0 0 221 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M109.014 71.9817C110.582 73.5501 111.739 75.6172 112.305 77.854C112.922 80.0806 112.963 82.4563 112.526 84.6777C112.475 84.9399 112.387 85.1919 112.325 85.4542C112.253 85.7113 112.202 85.9684 112.094 86.2306C111.904 86.75 111.724 87.2693 111.477 87.7681C111.035 88.7863 110.454 89.7427 109.826 90.6683C108.531 92.4989 106.947 94.1701 105.137 95.6048C103.337 97.0497 101.357 98.3044 99.2644 99.3637C98.2257 99.9088 97.1458 100.377 96.0506 100.819C94.9707 101.297 93.8394 101.647 92.7287 102.053C90.4713 102.752 88.1728 103.344 85.8331 103.729C83.4934 104.089 81.1332 104.367 78.7523 104.408C76.3767 104.46 73.9959 104.398 71.6253 104.136L70.7357 104.048L69.8513 103.925C69.2599 103.837 68.6686 103.765 68.0824 103.673C66.91 103.452 65.7324 103.261 64.5703 102.979C64.0972 102.871 63.6241 102.752 63.1562 102.614L61.7627 102.171L61.8501 102.187C59.0682 101.426 56.3274 100.49 53.6535 99.3842C50.9847 98.2632 48.3879 96.9777 45.8683 95.5482C40.8238 92.6995 36.1496 89.1925 31.9433 85.2176C29.5162 82.9088 27.2537 80.4303 25.1917 77.7923L22.1989 73.73L19.453 69.4929C15.9512 63.7388 13.1076 57.5837 10.8399 51.2126C6.30968 38.4549 4.05742 24.9259 3.16269 11.3557C3.06499 10.2965 3.0444 9.04686 2.96213 7.77161C2.89528 6.49636 2.79247 5.20059 2.72047 4.03846C2.55078 1.71421 2.24225 -0.0650247 1.66119 0.00182326C0.483643 0.135519 -0.333984 5.0617 0.133942 12.6001L0.370514 16.0145L0.704712 19.4289L0.874435 21.1361L1.09552 22.8381L1.54291 26.2422C2.25766 30.7622 3.04442 35.277 4.17056 39.7198C4.66934 41.9566 5.33267 44.1472 5.94972 46.3532L6.18112 47.1811L7.51807 51.2588C7.6929 51.8039 7.87291 52.349 8.08374 52.8786C8.90134 55.0178 9.65207 57.1774 10.6034 59.26C11.0662 60.3039 11.4827 61.3735 11.9763 62.4019L13.4779 65.482C16.4757 71.4624 20.1575 77.0878 24.4409 82.2711C28.7912 87.4081 33.8871 91.8818 39.4612 95.6407C45.0352 99.3894 51.1081 102.413 57.4998 104.526C63.8864 106.64 70.6123 107.823 77.3846 107.838C83.4574 107.843 89.5715 106.902 95.3152 104.814C98.1794 103.781 100.997 102.536 103.62 100.911C106.253 99.3071 108.716 97.3685 110.824 95.0288C111.868 93.8513 112.819 92.5812 113.642 91.2133C114.439 89.8301 115.102 88.3697 115.591 86.8322C116.547 83.6801 116.552 80.3377 115.74 77.2061C115.354 75.6326 114.711 74.1208 113.878 72.7067C113.482 71.9868 112.968 71.339 112.469 70.6808L111.621 69.7654C111.348 69.4518 110.999 69.2049 110.69 68.9221C108.124 66.7573 104.597 65.6055 101.182 66.1197C99.5884 66.3459 98.056 66.891 96.6933 67.6675C95.3307 68.4439 94.1171 69.4312 93.0578 70.5368C90.9444 72.7582 89.4223 75.4424 88.507 78.3271C87.602 81.2119 87.314 84.3435 87.9208 87.4082C87.998 87.7887 88.0802 88.1744 88.1933 88.5497L88.3527 89.1154L88.5481 89.645C88.8207 90.3444 89.0418 91.0694 89.3915 91.7327C89.7154 92.4115 90.0291 93.0954 90.4302 93.7279L91.001 94.6946C91.2066 95.0083 91.4278 95.3065 91.6386 95.6151C93.3612 98.0524 95.4746 100.156 97.7629 101.96C100.056 103.77 102.525 105.293 105.07 106.619C107.615 107.941 110.248 109.067 112.912 110.039L116.928 111.386L118.938 112.055C119.607 112.281 120.301 112.43 120.98 112.62C130.364 115.258 140.093 116.605 149.807 116.749C159.53 116.893 169.249 115.849 178.711 113.715C179.271 113.592 179.832 113.469 180.397 113.345C180.963 113.232 181.529 113.083 182.089 112.924C183.215 112.615 184.346 112.312 185.473 112.019C187.745 111.494 189.931 110.8 192.06 110.327L191.993 110.363C194.435 109.339 197.094 108.296 199.778 107.319C201.13 106.861 202.406 106.218 203.65 105.617C204.889 104.999 206.072 104.341 207.142 103.616C208.695 102.732 210.258 101.78 211.8 100.978C212.243 100.747 212.664 100.526 213.065 100.315C213.461 100.094 213.821 99.8573 214.166 99.6413C214.855 99.2094 215.467 98.8135 215.996 98.4535C217.056 97.7388 217.801 97.1783 218.233 96.7566C219.102 95.9133 218.727 95.6305 217.246 95.7847C216.598 95.8516 216.948 95.1729 215.241 96.0213C215.235 96.0265 215.133 96.1138 215.133 96.1138L215.169 96.0676C213.924 96.5818 212.69 97.2348 211.41 97.8981C210.104 98.5203 208.787 99.2146 207.466 99.9396C206.802 100.294 206.149 100.69 205.476 101.035C204.792 101.369 204.108 101.709 203.429 102.043C202.066 102.706 200.719 103.405 199.372 103.997C186.069 109.638 171.748 112.96 157.294 113.427C153.684 113.638 150.069 113.479 146.459 113.371L141.06 112.934C140.155 112.882 139.265 112.733 138.37 112.61L135.686 112.234C134.797 112.096 133.892 112.008 133.007 111.833L130.354 111.293C128.585 110.923 126.806 110.625 125.073 110.111C123.335 109.633 121.576 109.211 119.848 108.686L114.717 106.969C110.551 105.514 106.535 103.683 102.869 101.369C99.2027 99.0706 95.9426 96.1549 93.6749 92.6223C93.4126 92.1698 93.1298 91.7275 92.8778 91.2699L92.194 89.8661C91.8186 88.8942 91.4123 87.9224 91.2118 86.9659C90.7593 85.0222 90.821 82.9448 91.2169 80.9445C91.6335 78.939 92.4202 77.0004 93.5103 75.2727C94.6108 73.5552 96.0094 72.028 97.6498 70.9584C99.4444 69.7757 101.522 69.2101 103.543 69.4363L104.299 69.5494L105.049 69.7295L105.774 69.9866L106.139 70.11C106.258 70.1614 106.371 70.2282 106.484 70.2797L107.178 70.619L107.826 71.0458L108.155 71.2567L108.459 71.5086L109.07 72.0126C109.05 72.0126 109.029 71.9972 109.014 71.9817Z" fill="#CB356B"/>
                <path d="M220.403 95.1062C220.532 94.6023 220.702 94.0469 220.784 93.5482L220.984 92.2781C219.503 92.6123 217.92 93.0288 216.521 93.2807C216.434 93.2962 216.346 93.2396 216.259 93.219L216.269 93.2087L215.179 93.3939C214.911 93.435 214.639 93.4659 214.366 93.4813C213.101 93.5481 211.862 93.5584 210.572 93.8515C210.371 93.8927 210.032 93.8773 209.939 95.0342C209.841 96.2426 210.037 96.9625 210.433 96.942C211.379 96.8854 212.31 96.6231 213.235 96.8031C213.919 96.9317 214.603 96.9214 215.282 96.8597C215.451 96.8442 215.621 96.8237 215.791 96.8031L216.197 96.7466C216.31 96.7311 216.377 96.7209 216.428 96.726C216.516 96.7363 216.603 96.7209 216.696 96.7003C216.701 96.7826 216.665 96.9266 216.614 97.0345C216.588 97.0808 216.552 97.1271 216.516 97.158L216.5 97.1682L216.47 97.2608L216.408 97.4562L216.284 97.8521C216.12 98.3766 215.971 98.9063 215.883 99.441C215.734 100.372 215.873 101.349 215.827 102.295C215.817 102.516 215.837 102.763 215.364 102.891L215.349 102.886C215.827 103.226 214.804 103.354 215.534 103.73C215.539 103.817 215.601 103.92 215.544 103.997C215.287 104.347 215.683 104.516 217.015 104.609C217.308 104.629 217.678 104.727 217.894 104.665L217.873 104.655L217.894 104.66C218.825 104.552 218.454 104.162 218.521 103.879C218.85 102.48 219.102 101.061 219.385 99.6519L219.622 98.3509C219.663 98.1298 219.709 97.9344 219.766 97.6928C219.848 97.302 219.946 96.906 220.054 96.4946C220.172 96.0575 220.439 95.5176 220.408 95.0959L220.403 95.1062Z" fill="#CB356B"/>
              </svg>
            </div>
            <RichText as="p" className="download-tagline" content="Inspired to build something similar?" />
            <RichText as="h2" className="download-title" content={downloadTitle} />
            <RichText as="p" className="download-description" content={downloadDescription} />
            <div className="download-buttons">
              {ctaButtons.length > 0 ? (
                ctaButtons.map((button, index) => (
                  <a
                    key={`${button.url}-${index}`}
                    href={button.url}
                    className="cta-image-button"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={button.label || `Project link ${index + 1}`}
                  >
                    {button.image ? (
                      <img
                        src={button.image}
                        alt={button.label || `Project link ${index + 1}`}
                        className="cta-button-image"
                        onError={(event) => {
                          // eslint-disable-next-line no-param-reassign
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="cta-button-fallback">{button.label || 'Open link'}</span>
                    )}
                  </a>
                ))
              ) : websiteUrl ? (
                <a href={websiteUrl} className="cta-button" target="_blank" rel="noreferrer">
                  Visit Project
                </a>
              ) : (
                <button className="cta-button" onClick={() => setIsModalOpen(true)}>Discuss your project</button>
              )}
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
          transition={sectionTransition(0.3)}
        >
          <div className="cta-container">
            <p className="cta-label">Interested in working with us?</p>
            <h2 className="cta-title">{ctaTitle}</h2>
            <button className="cta-button" onClick={() => setIsModalOpen(true)}>Get Started</button>
          </div>
        </motion.section>
      </main>
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
      <RequestQuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} services={initialServices} />
    </>
  );
};

export default ProjectDetails;
