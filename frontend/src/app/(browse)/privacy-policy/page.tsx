import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">
        Last Updated: August 17, 2024
      </p>

      <p className="mb-4">
        At <strong>FENRISS</strong>, we are committed to protecting your
        privacy. This Privacy Policy explains how we collect, use, and safeguard
        your information when you use our product, <strong>ChatKraken</strong>.
        By using ChatKraken, you agree to the terms outlined in this policy.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">1. Information We Collect</h2>
      <p className="mb-4">
        We collect the following types of information from our users:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>
          <strong>Email Address:</strong> Collected during account creation and
          communication.
        </li>
        <li>
          <strong>IP Address:</strong> Automatically collected when you interact
          with ChatKraken.
        </li>
        <li>
          <strong>Usage Data:</strong> Includes information about how you use
          ChatKraken, such as interaction patterns and feature usage.
        </li>
      </ul>

      <h2 className="mb-4 text-2xl font-semibold">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">
        We use the information we collect for the following purposes:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>
          <strong>Service Improvement:</strong> To understand how our users
          interact with ChatKraken and improve our product.
        </li>
        <li>
          <strong>Order Fulfillment:</strong> To process transactions and
          fulfill orders.
        </li>
        <li>
          <strong>Marketing:</strong> To send promotional communications that
          may be of interest to you.
        </li>
      </ul>

      <h2 className="mb-4 text-2xl font-semibold">3. Third-Party Services</h2>
      <p className="mb-4">
        We use several third-party services to operate and improve ChatKraken.
        These services may have access to your data as part of their
        functionality:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>
          <strong>Google Analytics:</strong> For tracking and analyzing website
          usage.
        </li>
        <li>
          <strong>Stripe:</strong> For payment processing.
        </li>
        <li>
          <strong>X (formerly Twitter):</strong> For social media integration.
        </li>
        <li>
          <strong>Discord:</strong> For community interaction.
        </li>
        <li>
          <strong>OpenAI, Gemini, Perplexity, Stability AI, Claude AI:</strong>{" "}
          For enhancing the chatbot experience.
        </li>
      </ul>
      <p className="mb-4">
        Please refer to the privacy policies of these services for more
        information on how they handle your data.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">4. User Rights</h2>
      <p className="mb-4">You have the right to:</p>
      <ul className="mb-4 list-inside list-disc">
        <li>
          <strong>Access Your Data:</strong> Request access to the data we hold
          about you.
        </li>
        <li>
          <strong>Delete Your Data:</strong> Request the deletion of your data
          from our systems. This will be done in compliance with applicable laws
          and regulations.
        </li>
      </ul>
      <p className="mb-4">
        To exercise these rights, please contact us at{" "}
        <a
          href="mailto:hello@chatkraken.com"
          className="text-blue-500 hover:underline"
        >
          hello@chatkraken.com
        </a>
        .
      </p>

      <h2 className="mb-4 text-2xl font-semibold">
        5. Data Storage and Security
      </h2>
      <p className="mb-4">
        Your data is securely stored and encrypted on AWS servers, and we fully
        comply with the General Data Protection Regulation (GDPR) of European
        countries. We do not have access to or collect your messages to the
        chatbots.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">
        6. Cookies and Tracking Technologies
      </h2>
      <p className="mb-4">
        We use cookies for essential functions such as logging in and providing
        our services. By using ChatKraken, you agree to the use of cookies in
        accordance with this policy.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">7. Children's Privacy</h2>
      <p className="mb-4">
        ChatKraken is not intended for use by children under the age of 13. We
        do not knowingly collect personal information from children.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">
        8. International Data Transfers
      </h2>
      <p className="mb-4">
        As part of our operations, we may transfer your data internationally. We
        ensure that these transfers comply with all applicable international
        data protection regulations.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">9. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about your privacy, please contact
        us at:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a
          href="mailto:hello@chatkraken.com"
          className="text-blue-500 hover:underline"
        >
          hello@chatkraken.com
        </a>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
