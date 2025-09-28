/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for API routes that use dynamic features
  experimental: {
    serverComponentsExternalPackages: ['chromadb'],
  },
  // Production configuration for deployment
  output: 'standalone',
  // Ensure proper asset loading in production
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Configure for production deployment
  trailingSlash: false,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })

    // Ensure proper chunk loading in production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      }
    }

    return config
  },
}

module.exports = nextConfig
