import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/v1", destination: "/v1/index.html" },
      { source: "/v1/", destination: "/v1/index.html" },
      { source: "/v1/zh", destination: "/v1/zh.html" },
    ];
  },
};

export default nextConfig;
