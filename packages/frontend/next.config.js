/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    unoptimized: true // Для статической экспортации
  },
  // Отключаем eslint во время сборки в Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Отключаем проверку типов во время сборки в Vercel
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 