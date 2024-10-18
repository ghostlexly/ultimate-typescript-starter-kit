import React from "react";

const LegalStuff = () => {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Legal Notice</h1>

      <h2 className="mb-4 text-2xl font-semibold">1. Legal Information</h2>
      <p className="mb-4">
        <strong>Site Owner:</strong> <br />
        FENRISS <br />
        52 Traverse Grandjean <br />
        13013 Marseille, France <br />
        <strong>Email:</strong>{" "}
        <a
          href="mailto:hello@chatkraken.com"
          className="text-blue-500 hover:underline"
        >
          hello@chatkraken.com
        </a>
      </p>

      <h2 className="mb-4 text-2xl font-semibold">2. Hosting Provider</h2>
      <p className="mb-4">
        <strong>Website Host:</strong> <br />
        Amazon Web Services (AWS) <br />
        Address: 31 Place des Corolles, 92400 Courbevoie, France <br />
        <strong>Phone:</strong> +33 (0)1 46 17 10 00
      </p>

      <h2 className="mb-4 text-2xl font-semibold">3. Publication Director</h2>
      <p className="mb-4">
        <strong>Publication Director:</strong> <br />
        Tolga MALKOC, CEO of FENRISS
      </p>

      <h2 className="mb-4 text-2xl font-semibold">4. Website Development</h2>
      <p className="mb-4">
        <strong>Development and Maintenance:</strong> <br />
        52 traverse grandjean <br />
        13013 Marseille, France
      </p>

      <h2 className="mb-4 text-2xl font-semibold">5. Intellectual Property</h2>
      <p className="mb-4">
        All content (texts, images, videos, etc.) on the ChatKraken website is
        the exclusive property of FENRISS, unless otherwise stated. Any
        reproduction, distribution, modification, adaptation, retransmission, or
        publication of these elements is strictly prohibited without the express
        written consent of FENRISS.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">
        6. Limitation of Liability
      </h2>
      <p className="mb-4">
        FENRISS cannot be held liable for any direct or indirect damage to the
        user's equipment when accessing the ChatKraken site, resulting either
        from the use of equipment that does not meet the specifications
        indicated, or from the appearance of a bug or incompatibility.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">7. Cookies</h2>
      <p className="mb-4">
        Browsing the ChatKraken website may cause the installation of cookie(s)
        on the user's computer. A cookie is a small file that does not allow the
        identification of the user but records information related to the
        browsing of a computer on a site. The data obtained is intended to
        facilitate subsequent browsing on the site and also aims to allow
        various measures of traffic.
      </p>

      <h2 className="mb-4 text-2xl font-semibold">
        8. Governing Law and Jurisdiction
      </h2>
      <p className="mb-4">
        Any dispute related to the use of the ChatKraken website is subject to
        French law. Exclusive jurisdiction is granted to the competent courts of
        Aix-en-Provence, France.
      </p>
    </div>
  );
};

export default LegalStuff;
