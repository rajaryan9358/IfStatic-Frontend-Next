"use client";

import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Stats from '@/components/Stats';
import Portfolio from '@/components/Portfolio';
import Testimonials from '@/components/Testimonials';
import WhyChooseUs from '@/components/WhyChooseUs';
import Team from '@/components/Team';
import Contact from '@/components/Contact';

const buildSections = (initialServices, initialPortfolios, initialPortfoliosIsFallback, initialTestimonials) => ([
  { key: 'hero', render: () => <Hero initialServices={initialServices} /> },
  { key: 'why-choose-us', render: () => <WhyChooseUs /> },
  { key: 'stats', render: () => <Stats /> },
  { key: 'services', render: () => <Services initialServices={initialServices} /> },
  { key: 'about', render: () => <About /> },
  {
    key: 'portfolio',
    render: () => (
      <Portfolio
        initialPortfolios={initialPortfolios}
        initialIsFallback={initialPortfoliosIsFallback}
      />
    ),
  },
  {
    key: 'testimonials',
    render: () => <Testimonials initialTestimonials={initialTestimonials} pagePath="/" />,
  },
  { key: 'team', render: () => <Team /> },
  { key: 'contact', render: () => <Contact /> },
]);

export default function HomeClient({ initialServices, initialPortfolios, initialPortfoliosIsFallback, initialTestimonials }) {
  const sections = buildSections(initialServices, initialPortfolios, initialPortfoliosIsFallback, initialTestimonials);
  return (
    <>
      {sections.map(({ key, render }) => (
        <section key={key} className={`home-section home-section-${key}`}>
          {render()}
        </section>
      ))}
    </>
  );
}
