/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for API routes that use dynamic features
  experimental: {
    serverComponentsExternalPackages: ['chromadb'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })

    return config
  },
}

module.exports = nextConfig
