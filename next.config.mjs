/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  // Adjust the basePath if your repository is named something other than your username.github.io
  // For example, if your repo is "my-project", set basePath: '/my-project'
  basePath: process.env.NODE_ENV === 'production' ? '/project%206%20nextjs' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;