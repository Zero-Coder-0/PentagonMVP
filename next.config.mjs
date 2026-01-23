/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double-render issues with Leaflet
  transpilePackages: ['react-leaflet', 'leaflet'], // Force compilation for these packages
};

export default nextConfig;
