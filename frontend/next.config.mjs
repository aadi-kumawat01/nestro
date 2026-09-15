/** @type {import('next').NextConfig} */
// Keep browser calls same-origin so authentication cookies never need to be
// exposed to a public API URL. API_BASE_URL must include the Express `/api`
// prefix (for example, https://api.example.com/api).
const apiBaseUrl = (
  process.env.API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
