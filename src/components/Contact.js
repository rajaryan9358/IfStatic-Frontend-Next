"use client";

import React, { useState } from 'react';
import Toast from './Toast';

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Unable to send message right now.');
  }

  return data;
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState({ state: 'idle', message: '' });
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormStatus({ state: 'error', message: 'Please fill in all required fields.' });
      setToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setFormStatus({ state: 'loading', message: 'Submitting your form…' });

    try {
      await postJson('/api/backend/public/contact-queries', {
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        source: 'homepage-contact',
      });

      setFormStatus({ state: 'success', message: "Thanks! We'll reach out shortly." });
      setFormData({ name: '', subject: '', email: '', message: '' });
      setToast({ type: 'success', message: "Thanks! We'll reach out shortly." });
    } catch (error) {
      const message = error?.message || 'Unable to send message right now.';
      setFormStatus({ state: 'error', message });
      setToast({ type: 'error', message });
    }
  };

  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-left">
          <div className="contact-header">
            <p className="contact-label">CONTACT</p>
            <h2 className="contact-title">Contact Us</h2>
            <p className="contact-description">
              Have questions or need more information? Reach out to us using the form below or contact us directly.
            </p>
          </div>

          <div className="contact-info">
            <h3 className="contact-info-title">Contact Info :</h3>
            <div className="contact-info-items">
              <div className="contact-info-item">
                <div className="contact-icon email-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>
                  <a href="mailto:contact@ifstatic.com">contact@ifstatic.com</a>
                </span>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon phone-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.08 4.18 2 2 0 014.06 2h3a2 2 0 012 1.72c.12.86.36 1.7.7 2.49a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.79.34 1.63.58 2.49.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>
                  <a href="tel:+918076689373">+91 8076689373</a>
                </span>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon location-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Centurian+Park+O2+Valley,+Greater+Noida+West,+UP,+India"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Centurian Park O2 Valley, Greater Noida West, UP, India
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="form-input name-input"
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email ID"
              value={formData.email}
              onChange={handleChange}
              className="form-input full-width"
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              className="form-textarea"
              rows="5"
              required
            />
            <button type="submit" className="submit-button" disabled={formStatus.state === 'loading'}>
              {formStatus.state === 'loading' ? 'Submitting…' : 'Submit'}
            </button>
            {formStatus.state === 'loading' && (
              <span className="submit-feedback" role="status" aria-live="polite">
                Submitting your form…
              </span>
            )}
          </form>
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onDismiss={() => setToast(null)} />
    </section>
  );
};

export default Contact;
