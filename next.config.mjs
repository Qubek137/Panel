/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Usuń assetPrefix dla poprawki błędu kompilacji
  // assetPrefix: './',
  basePath: '',
  experimental: {
    // Usuń esmExternals zgodnie z ostrzeżeniem
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: 'true',
  },
};

export default nextConfig;
