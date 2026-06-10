import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep native/CJS parsers out of the webpack bundle (pdf-parse reads a
  // sample file at import time; mammoth uses Node APIs).
  serverExternalPackages: ["pdf-parse", "mammoth"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // allow CV file uploads + resume text payloads
    },
  },
};

export default nextConfig;
