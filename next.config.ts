import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@raffle-hub/shared"],
};

export default nextConfig;
