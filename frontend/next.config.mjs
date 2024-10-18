/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "nginx" },
      { hostname: "cl.avis-verifies.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "d3dlzw3vmnvewv.cloudfront.net" },
      { hostname: "terracapital.fenriss.com" },
      { hostname: "s3.terra-capital.fr" },
    ],
  },

  poweredByHeader: false,

  async headers() {
    // Disable cache in development mode
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/(.*)",
            headers: [
              {
                key: "Cache-Control",
                value: "no-store, no-cache, must-revalidate, proxy-revalidate",
              },
              {
                key: "Pragma",
                value: "no-cache",
              },
              {
                key: "Expires",
                value: "0",
              },
            ],
          },
        ]
      : [];
  },
};

export default nextConfig;
