/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16+ uses serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Ensure Prisma engines directory is included in the traced files for serverless bundles
  experimental: {
    outputFileTracingIncludes: {
      // Include Prisma engines for all routes
      '**/*': ['node_modules/.prisma/client/**/*']
    }
  },
  // Enable Turbopack configuration (required in Next.js 16)
  turbopack: {},
}

module.exports = nextConfig
