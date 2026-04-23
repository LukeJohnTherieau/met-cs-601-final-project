import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "**"
      },
    ],
  },
  compiler: {
    styledComponents: true
  },
};

export default nextConfig;