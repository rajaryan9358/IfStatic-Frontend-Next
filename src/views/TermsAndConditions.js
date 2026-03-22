'use client';
import React from 'react';
import './Legal.css';

function TermsAndConditions() {
  return (
    <main className="legal-page">
      <div className="legal-inner">
        <p className="legal-label">Legal</p>
        <h1 className="legal-title">Terms & Conditions</h1>
        <p className="legal-updated">Last updated: Jan 1, 2025</p>

        <p>
          By using IfStatic Technologies services or accessing our website, you agree to these
          Terms and to comply with all applicable laws. If you do not agree, please discontinue
          use of the site and services.
        </p>
        <p>
          Services are provided for lawful purposes only. You are responsible for the content and
          materials you supply, and for ensuring you have rights to share them. We may modify or
          suspend services where required for security, maintenance, or legal reasons.
        </p>
        <p>
          Deliverables and materials remain our intellectual property until full payment is
          received; thereafter, ownership or license rights transfer as outlined in the applicable
          project agreement. Brand assets and third-party materials remain the property of their
          respective owners.
        </p>
        <p>
          Fees and payment schedules follow the project or service agreement. Late or missed
          payments may result in suspension of services and may incur additional charges as
          permitted by law.
        </p>
        <p>
          To the fullest extent permitted, IfStatic Technologies is not liable for indirect,
          incidental, or consequential damages arising from use of our services or inability to use
          them. Our total liability is limited to the amount you paid for the services giving rise
          to the claim.
        </p>
        <p>
          We may update these Terms from time to time. Material changes will be noted by updating
          the date above. Continued use of the site or services after changes means you accept the
          revised Terms.
        </p>
        <p>
          For questions about these Terms, contact us at <a href="mailto:contact@ifstatic.com">contact@ifstatic.com</a>.
        </p>
      </div>
    </main>
  );
}

export default TermsAndConditions;
