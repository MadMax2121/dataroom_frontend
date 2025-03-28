/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Adjust the basePath if your repository is named something other than your username.github.io
  // For example, if your repo is "my-project", set basePath: '/my-project'
  basePath: process.env.NODE_ENV === 'production' ? '/project%206%20nextjs' : '',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  typescript: {
    // WARNING: This allows production builds to complete even if there are type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
