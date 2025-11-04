/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16+ uses serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Enable Turbopack configuration (required in Next.js 16)
  turbopack: {},
}

module.exports = nextConfig
