export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              InFlow ("we," "us," "our," or "Company") operates the InFlow platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service. Your use of the Service indicates your acceptance of this Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">A. Information You Provide Directly</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> When you create an account, we collect your name, email address, password, business name, phone number, and other profile information you choose to provide.
              </li>
              <li>
                <strong>Business Information:</strong> We collect information about your business, including business address, industry, business type, and operational details necessary to provide our services.
              </li>
              <li>
                <strong>Payment Information:</strong> We collect billing address, payment method details, and transaction history through our payment processor. We do not directly store credit card information on our servers.
              </li>
              <li>
                <strong>Communications:</strong> When you contact us via email, chat, or other communication channels, we collect the content of your messages and any attachments.
              </li>
              <li>
                <strong>Customer Data:</strong> We collect data you input into the Service, including customer information, bookings, invoices, quotes, inventory, and business transactions.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">B. Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Device Information:</strong> Device type, operating system, unique device identifiers, device settings, and mobile network information.
              </li>
              <li>
                <strong>Usage Information:</strong> Pages visited, time spent on pages, links clicked, features accessed, and actions taken within the Service.
              </li>
              <li>
                <strong>Location Information:</strong> IP address and approximate geographic location based on IP address (not precise GPS coordinates without permission).
              </li>
              <li>
                <strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, pixels, and similar tracking technologies to collect usage data and enhance your experience.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">C. Information from Third Parties</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Third-Party Services:</strong> If you integrate third-party services with our platform (e.g., WhatsApp, payment processors), we receive data from those services as necessary for integration.
              </li>
              <li>
                <strong>Social Media:</strong> If you link your social media account to our Service, we receive publicly available information from your profile.
              </li>
              <li>
                <strong>Service Providers:</strong> Our analytics, hosting, and payment providers may share data with us as part of providing their services.
              </li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing, maintaining, and improving the Service</li>
              <li>Processing transactions and sending transaction confirmations</li>
              <li>Creating and managing your account</li>
              <li>Sending you service-related announcements and updates</li>
              <li>Responding to your inquiries, comments, and support requests</li>
              <li>Sending marketing communications (with your consent where required)</li>
              <li>Conducting analytics and usage tracking to improve user experience</li>
              <li>Protecting against fraudulent, malicious, or illegal activity</li>
              <li>Complying with legal obligations and enforcing our Terms of Service</li>
              <li>Personalizing and optimizing your experience with the Service</li>
              <li>Conducting research, surveys, and generating anonymized insights</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security and Protection</h2>
            <p>
              We implement comprehensive security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Monitoring and logging of system access</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is completely secure. While we strive to protect your personal information using reasonable safeguards, we cannot guarantee absolute security. You use the Service at your own risk.
            </p>
          </section>

          {/* User Rights and Access */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Data Access</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Right of Access:</strong> You have the right to request a copy of your personal data that we hold.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You can request that we correct inaccurate or incomplete information.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You may request deletion of your personal data, subject to legal and operational requirements.
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You can request your data in a portable, machine-readable format.
              </li>
              <li>
                <strong>Right to Object:</strong> You can object to certain types of data processing, including marketing communications.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> You may request limitation of how your data is processed.
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Where we rely on your consent, you can withdraw it at any time.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the contact information provided below.
            </p>
            <p className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <strong className="text-gray-900">South African Residents (POPIA):</strong> If you are a South African resident and believe your privacy rights under the Protection of Personal Information Act (POPIA) have been infringed, you may lodge a complaint with the South African Information Regulator at <a href="https://inforegulator.org.za" className="text-blue-600 hover:text-blue-800 font-semibold">inforegulator.org.za</a>.
            </p>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Sharing Your Information</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">A. Information We Do Not Share</h3>
            <p>
              We do not sell, trade, rent, or lease your personal information to third parties for marketing purposes. Your customer data remains your property and is not shared with other users or businesses without your explicit consent.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">B. Meta Platform Data Handling</h3>
            <p>
              We strictly comply with Meta Developer Policies and handle Meta Platform Data with the highest level of care and confidentiality. Meta Platform Data includes messages, user profiles, and interactions retrieved from WhatsApp Business and Instagram integration services.
            </p>
            <p className="mt-2">
              <strong>Important:</strong> We use Meta Platform Data solely to provide the unified inbox service to you, our customer. We absolutely do not sell, share, rent, lease, or use Meta Platform Data for any independent marketing, tracking, or advertising purposes. This data remains under your control and is processed exclusively to deliver the communication management functionality you have authorized.
            </p>
            <p className="mt-2">
              All Meta Platform Data is treated with the same security and confidentiality standards as your other personal information. Your integration with Meta platforms remains under your control, and you can disconnect or revoke permissions at any time.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">C. Information We Share With</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Providers:</strong> We share data with third-party service providers who perform services on our behalf, including hosting providers, payment processors, analytics providers, and customer support platforms. These providers are contractually obligated to protect your data.
              </li>
              <li>
                <strong>Integrated Services:</strong> If you authorize integration with third-party services (e.g., WhatsApp Business API, Instagram), we share necessary data to facilitate that integration. These integrations are performed in strict compliance with each platform's data protection and developer policies.
              </li>
              <li>
                <strong>Legal Compliance:</strong> We may disclose information when required by law, court order, or government request, or to protect our rights, privacy, safety, or property.
              </li>
              <li>
                <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your information becomes subject to a different privacy policy.
              </li>
              <li>
                <strong>With Your Consent:</strong> We share information with third parties when you explicitly authorize us to do so.
              </li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Similar Technologies</h2>
            <p>
              We use cookies, web beacons, and similar tracking technologies to enhance your experience, remember preferences, and analyze usage patterns.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser.
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Cookies that remain on your device for a specified period to remember your preferences.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Used to track usage patterns and improve the Service.
              </li>
              <li>
                <strong>Functional Cookies:</strong> Enable core functionality of the Service.
              </li>
            </ul>
            <p>
              Most web browsers allow you to control cookies through settings. If you disable cookies, some features of the Service may not function properly.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services and Links</h2>
            <p>
              Our Service may contain links to third-party websites and services that are not operated by us. This Privacy Policy does not apply to third-party websites and services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services before providing your information.
            </p>
            <p>
              If you integrate third-party services with our platform, please review those services' privacy policies and terms of service. Your use of third-party services is governed by their terms and policies.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements. The retention period may vary depending on the context of the processing and our legal obligations.
            </p>
            <p>
              You can request deletion of your account and associated data at any time by contacting us. Upon deletion, we will remove your personal information from active systems, though some data may be retained in backups for a limited period or as required by law.
            </p>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Data Deletion and Meta Integration</h4>
              <p className="text-gray-700">
                <strong>If you wish to delete your account or request the removal of data retrieved via Meta integration (WhatsApp/Instagram), you can submit a formal deletion request at any time by emailing <a href="mailto:privacy@inflow.app" className="text-blue-600 hover:text-blue-800 font-semibold">privacy@inflow.app</a>.</strong> Upon receiving your deletion request, all connected platform data will be purged from active servers within 30 days. We will provide confirmation of data deletion upon completion.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p>
              The Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we discover that we have collected personal information from a child under 18, we will promptly delete such information. If you believe we have collected information from a child under 18, please contact us immediately.
            </p>
          </section>

          {/* International Data Transfer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfer</h2>
            <p>
              Your information may be transferred to, stored in, and processed in countries other than your country of residence, which may have different data protection laws. By using the Service, you consent to the transfer of your information to countries outside your country of residence, which may not have the same data protection laws.
            </p>
            <p>
              We implement appropriate safeguards, including standard contractual clauses, to protect your information when transferred internationally.
            </p>
          </section>

          {/* California Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. California Consumer Privacy Act (CCPA)</h2>
            <p>
              If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to know what personal information is collected, used, shared, and sold</li>
              <li>The right to delete personal information collected from you</li>
              <li>The right to opt-out of the sale or sharing of personal information</li>
              <li>The right to non-discrimination for exercising your CCPA rights</li>
            </ul>
            <p>
              To exercise these rights or submit a request, please contact us using the information provided below.
            </p>
          </section>

          {/* Policy Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, and other factors. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date above.
            </p>
            <p>
              Your continued use of the Service after any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this policy regularly to stay informed about how we protect your information.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, concerns about your privacy, or wish to exercise your privacy rights, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-4">
              <p className="font-semibold text-gray-900 mb-2">InFlow</p>
              <p className="text-gray-700 mb-4">
                For privacy inquiries and data subject requests, please email us at:{" "}
                <a href="mailto:privacy@inflow.app" className="text-blue-600 hover:text-blue-800 font-semibold">
                  privacy@inflow.app
                </a>
              </p>
              <p className="text-gray-700 mb-4">
                For general inquiries, you can reach us at:{" "}
                <a href="mailto:support@inflow.app" className="text-blue-600 hover:text-blue-800 font-semibold">
                  support@inflow.app
                </a>
              </p>
              <p className="text-gray-600 text-sm">
                We will respond to your request within 30 days or as required by applicable law.
              </p>
            </div>
          </section>

          {/* Compliance Notice */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Legal Compliance</h2>
            <p>
              This Privacy Policy is designed to comply with international privacy standards and regulations, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>General Data Protection Regulation (GDPR) - for EU residents</li>
              <li>California Consumer Privacy Act (CCPA) - for California residents</li>
              <li>Personal Information Protection and Electronic Documents Act (PIPEDA) - for Canadian residents</li>
              <li>Protection of Personal Information Act (POPIA) - for South African residents</li>
              <li>Other applicable state and international privacy laws</li>
            </ul>
          </section>

          {/* Acknowledgment */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-8">
            <p className="text-gray-700 text-sm">
              <strong>Privacy Policy Acknowledgment:</strong> By using the InFlow Service, you acknowledge that you have read this Privacy Policy and understand our privacy practices. If you do not agree with any part of this policy, please do not use our Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
