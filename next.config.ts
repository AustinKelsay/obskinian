import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["react-force-graph-2d", "force-graph", "react-kapsule"],
};

export default nextConfig;
