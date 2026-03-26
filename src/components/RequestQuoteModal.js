"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getPublicApiBaseCandidates, resolvePublicApiUrl } from '@/lib/publicApiBase';
import Toast from './Toast';

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
        const message = data?.message || 'Request failed.';
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

  throw lastError || new Error('Request failed.');
}

const parseSortNumber = (service) => {
  const raw =
    service?.sortNumber ??
    service?.sort_number ??
    service?.sortOrder ??
    service?.sort_order ??
    service?.sequence ??
    service?.order ??
    service?.position;

  if (raw === null || raw === undefined || raw === '') return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

const RequestQuoteModal = ({ isOpen, onClose, services = [], defaultServiceAlias = '' }) => {
  const serviceOptions = useMemo(() => {
    const list = (Array.isArray(services) ? services : []).filter(Boolean);

    const decorated = list.map((service, index) => ({
      service,
      index,
      sort: parseSortNumber(service),
    }));

    decorated.sort((a, b) => {
      const aHas = a.sort !== null;
      const bHas = b.sort !== null;
      if (aHas && bHas && a.sort !== b.sort) return a.sort - b.sort;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return a.index - b.index; // keep API order
    });

    return decorated.map((d) => d.service);
  }, [services]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: defaultServiceAlias || '',
    appType: '',
    projectDetails: '',
  });

  const [contactMethod, setContactMethod] = useState('email');
  const [submitState, setSubmitState] = useState({ state: 'idle', message: '' });
  const [toast, setToast] = useState(null);
  const [appTypeOptions, setAppTypeOptions] = useState([]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: defaultServiceAlias || '',
      appType: '',
      projectDetails: '',
    });
    setAppTypeOptions([]);
    setContactMethod('email');
    setSubmitState({ state: 'idle', message: '' });
  }, [defaultServiceAlias]);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen, resetForm]);

  const findService = useCallback(
    (key) => {
      const normalized = (key || '').toLowerCase();
      return serviceOptions.find((s) => (s.alias || s.name || '').toLowerCase() === normalized);
    },
    [serviceOptions]
  );

  useEffect(() => {
    if (!formData.service) {
      setAppTypeOptions([]);
      return;
    }
    const matched = findService(formData.service);
    const mobileTitles = (matched?.mobileApps || []).map((m) => m.title).filter(Boolean);
    setAppTypeOptions(mobileTitles);
  }, [formData.service, findService]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServiceChange = (e) => {
    const selected = e.target.value;
    setFormData((prev) => ({ ...prev, service: selected, appType: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ state: 'loading', message: 'Submitting your form…' });

    try {
      await postJson('/quote-requests', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service.trim(),
        appType: formData.appType.trim(),
        projectDetails: formData.projectDetails.trim(),
        contactMethod,
        source: 'request-quote-modal',
      });

      setSubmitState({ state: 'success', message: 'Request sent! We will contact you shortly.' });
      resetForm();
      setToast({ type: 'success', message: 'Request sent! We will contact you shortly.' });
      onClose();
    } catch (error) {
      const message = error?.message || 'Unable to submit your request right now.';
      setSubmitState({ state: 'error', message });
      setToast({ type: 'error', message });
    }
  };

  const isSubmitting = submitState.state === 'loading';
  const servicePlaceholder = serviceOptions.length ? 'Select a service' : 'No services available';

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Request a Quote</h2>
                <p className="modal-subtitle">Tell us about your project and we'll get back to you soon</p>
              </div>

              <form className="quote-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Required *</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleServiceChange}
                      className="form-control"
                      required
                      disabled={!serviceOptions.length || isSubmitting}
                    >
                      <option value="">{servicePlaceholder}</option>
                      {serviceOptions.map((service) => (
                        <option key={service.id || service.alias} value={service.alias}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Type of Application (optional)</label>
                    <select
                      name="appType"
                      value={formData.appType}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!serviceOptions.length || isSubmitting}
                    >
                      <option value="">Select app type (optional)</option>
                      {[...appTypeOptions, 'Other']
                        .filter(Boolean)
                        .filter((v, i, arr) => arr.indexOf(v) === i)
                        .map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Project Details *</label>
                    <textarea
                      name="projectDetails"
                      value={formData.projectDetails}
                      onChange={handleChange}
                      placeholder="Tell us about your project requirements..."
                      className="form-control form-textarea"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Preferred Contact Method</label>
                    <div className="contact-methods" role="group" aria-label="Preferred contact method">
                      {[
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`contact-method ${contactMethod === opt.value ? 'selected' : ''}`}
                          aria-pressed={contactMethod === opt.value}
                          onClick={() => setContactMethod(opt.value)}
                          disabled={isSubmitting}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {submitState.state === 'error' && submitState.message && (
                  <p className="submit-feedback error">{submitState.message}</p>
                )}

                {isSubmitting && (
                  <span className="submit-feedback" role="status" aria-live="polite">
                    Submitting your form…
                  </span>
                )}

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting…' : 'Submit Request'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </>
  );
};

export default RequestQuoteModal;
