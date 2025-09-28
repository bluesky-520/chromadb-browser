/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for API routes that use dynamic features
  experimental: {
    serverComponentsExternalPackages: ['chromadb'],
  },
  // Production configuration for deployment
  output: 'standalone',
  // Configure for production deployment
  trailingSlash: false,
  // Disable static optimization for dynamic routes
  generateStaticParams: false,
  // Ensure proper asset loading
  assetPrefix: '',
  basePath: '',
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })

    // Fix chunk loading issues in production
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
      
      // Ensure proper chunk loading
      config.output.chunkLoadingGlobal = 'webpackChunkchromadb-admin'
      config.output.globalObject = 'self'
    }

    return config
  },
}

module.exports = nextConfig
