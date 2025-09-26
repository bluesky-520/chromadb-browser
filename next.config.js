/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export for S3
  trailingSlash: true, // Add trailing slashes for S3 compatibility
  images: {
    unoptimized: true, // Disable image optimization for static export
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
