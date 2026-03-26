'use client';
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';
import { getPublicApiBaseCandidates, resolvePublicApiUrl } from '@/lib/publicApiBase';
import { useResponsiveSectionVariants } from '../lib/useResponsiveSectionVariants';

async function postJson(path, payload) {
  let lastError = null;

  for (const base of getPublicApiBaseCandidates()) {
    try {
      const res = await fetch(resolvePublicApiUrl(base, path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.message || 'Unable to send message right now.';
        if (res.status === 404) {
          lastError = new Error(message);
          continue;
        }
        throw new Error(message);
      }
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to send message right now.');
}

const sectionTransition = (delay = 0) => ({
  duration: 0.5,
  ease: 'easeOut',
  delay
});

function ContactPage() {
  const sectionVariants = useResponsiveSectionVariants();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [toast, setToast] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setToast({ type: 'error', message: 'Please fill the required fields (Name, Email, Message).' });
      return;
    }
    setStatus({ state: 'loading', message: 'Submitting your form…' });
    postJson('/contact-queries', {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
      source: 'contact-page'
    })
      .then(() => {
        setStatus({ state: 'success', message: "Thanks! We'll reach out shortly." });
        setFormData({ name: '', subject: '', email: '', message: '' });
        setToast({ type: 'success', message: "Thanks! We'll reach out shortly." });
        setTimeout(() => {
          setStatus({ state: 'idle', message: '' });
        }, 2000);
      })
      .catch((error) => {
        const message = error?.message || 'Unable to send your message right now.';
        setStatus({ state: 'error', message });
        setToast({ type: 'error', message });
      });
  }

  return (
    <>
      <motion.main
        className="contact-page"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={sectionTransition(0)}
      >
        <div className="contact-inner">
          <motion.div
            className="contact-heading-group"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.05)}
          >
            <span className="contact-label">CONTACT</span>
            <h1 className="contact-title">Contact us for any questions !</h1>
          </motion.div>

          <motion.div
            className="contact-grid"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionTransition(0.1)}
          >
            <motion.div
              className="contact-info"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={sectionTransition(0.15)}
            >
              <p className="info-heading">Contact Info :</p>
              <ul className="info-list" aria-label="Company contact information">
                <li>
                  <span className="info-icon" aria-hidden="true">{/* Mail Icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <span className="info-text">
                    <a href="mailto:contact@ifstatic.com">contact@ifstatic.com</a>
                  </span>
                </li>
                <li>
                  <span className="info-icon" aria-hidden="true">{/* Phone Icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.08 4.18 2 2 0 014.06 2h3a2 2 0 012 1.72c.12.86.36 1.7.7 2.49a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.79.34 1.63.58 2.49.7A2 2 0 0122 16.92z"/></svg>
                  </span>
                  <span className="info-text">
                    <a href="tel:+918076689373">+91 8076689373</a>
                  </span>
                </li>
                <li>
                  <span className="info-icon" aria-hidden="true">{/* Location Icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <span className="info-text">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Centurian+Park+O2+Valley,+Greater+Noida+West,+UP,+India"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Centurian Park O2 Valley, Greater Noida West, UP, India
                    </a>
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="contact-form-wrapper"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={sectionTransition(0.2)}
            >
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row two-cols">
                  <div className="form-field">
                    <label htmlFor="name" className="visually-hidden">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="subject" className="visually-hidden">Subject</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="email" className="visually-hidden">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email ID"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="message" className="visually-hidden">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={status.state === 'loading'}>
                    {status.state === 'loading' ? 'Submitting…' : 'Submit'}
                  </button>
                  {status.state === 'loading' && (
                    <span className="submit-feedback" role="status" aria-live="polite">
                      Submitting your form…
                    </span>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}

export default ContactPage;
