import { PageHeader } from "../components/PageHeader";

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Privacy Policy"
        subtitle="Last updated: October 19, 2025"
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Sanjari prints ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>We may collect personal information that you provide directly to us, including:</p>
          <ul>
            <li>Name and contact information (email, phone number)</li>
            <li>Billing and shipping address</li>
            <li>Payment information (processed securely through our payment gateway)</li>
            <li>Order history and preferences</li>
            <li>Account credentials</li>
          </ul>

          <h3>Files and Content</h3>
          <p>
            When you upload files for printing, we temporarily store these files only for the duration necessary
            to complete your order. Files are securely deleted after order completion.
          </p>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our website</li>
            <li>Referring website addresses</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>Processing and fulfilling your orders</li>
            <li>Communicating with you about your orders and our services</li>
            <li>Improving our website and services</li>
            <li>Sending promotional materials (with your consent)</li>
            <li>Detecting and preventing fraud</li>
            <li>Complying with legal obligations</li>
            <li>Analyzing usage patterns and trends</li>
          </ul>

          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third parties who assist us in operating our business (payment processors, shipping partners)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul>
            <li>Encryption of sensitive data</li>
            <li>Secure servers and data centers</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Employee training on data protection</li>
          </ul>

          <h2>6. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized
            content. You can control cookies through your browser settings, though this may affect website functionality.
          </p>

          <h2>7. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent where applicable</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>

          <h2>8. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy,
            unless a longer retention period is required by law. Order information is typically retained for 7 years
            for tax and accounting purposes.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal
            information from children. If you believe we have collected information from a child, please contact us
            immediately.
          </p>

          <h2>10. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for the privacy practices
            of these external sites. We encourage you to review their privacy policies.
          </p>

          <h2>11. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate
            safeguards are in place to protect your information in accordance with this policy.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
            the new policy on our website and updating the "Last Updated" date.
          </p>

          <h2>13. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
          <ul>
            <li>Email: sanjariprint@gmail.com</li>
            <li>Phone: +91 7350001266 / 9323684301</li>
            <li><strong>Address:</strong><br />
            <strong>Flat/Door/Block No.: 31</strong><br />
            <strong>Name of Premises/Building: c/o Shabbir Kirana Store</strong><br />
            <strong>Village/Town: Chouhan Colony</strong><br />
            <strong>Block/Landmark: Opp. ST Stand</strong><br />
            <strong>Road/Street/Lane: Near Bage Madina Masjid</strong><br />
            <strong>City: Bhiwandi</strong><br />
            <strong>District: Thane</strong><br />
            <strong>State: Maharashtra</strong><br />
            <strong>PIN: 421302</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
