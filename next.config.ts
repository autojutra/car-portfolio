import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/wiki/Special:FilePath/**",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/w/thumb.php",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
      {
        protocol: "https",
        hostname: "media.byd.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "news.mgmotor.eu",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "s-cdn.xpeng.com",
        pathname: "/commoncms/prod/**",
      },
    ],
  },
};

export default nextConfig;
