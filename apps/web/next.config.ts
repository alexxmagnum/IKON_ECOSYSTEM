import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@motanos/ui",
    "@motanos/core",
    "@motanos/config",
    "@motanos/contracts",
    "@motanos/ikon",
  ],
};

export default nextConfig;
