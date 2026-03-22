'use client';
import React from 'react';
import './Legal.css';

function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="legal-inner">
        <p className="legal-label">Legal</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: Jan 1, 2025</p>

        <p>
          We collect basic contact details you choose to share (such as name, email, and phone),
          project information provided for quotes or collaboration, and limited usage data to help
          us improve performance and security.
        </p>
        <p>
          The information we collect is used to respond to inquiries, deliver and improve our
          services, and communicate important updates. We do not sell personal data. We only share
          information with trusted partners when necessary to deliver services under confidentiality
          obligations.
        </p>
        <p>
          We apply reasonable technical and organizational safeguards to protect personal data,
          but no method of transmission or storage is completely secure. If you have security
          concerns, please contact us so we can help.
        </p>
        <p>
          You may request access, correction, or deletion of your personal data by emailing <a href="mailto:contact@ifstatic.com">contact@ifstatic.com</a>. We will respond consistent with applicable law.
        </p>
        <p>
          We may update this Privacy Policy periodically. Material changes will be reflected in the
          date above. Continued use of our site or services after an update means you accept the
          revised policy.
        </p>
        <p>
          For any privacy questions, contact us at <a href="mailto:contact@ifstatic.com">contact@ifstatic.com</a>.
        </p>
      </div>
    </main>
  );
}

export default PrivacyPolicy;
