import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "encrypted-tbn0.gstatic.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "www.tendenciainternacional.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "www.rosemontmedia.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "ik.imagekit.io",
        protocol: "https",
        port: "",
      },
    ],
  },
};

export default nextConfig;
