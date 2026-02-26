/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents Leaflet double-render bugs
  transpilePackages: ['react-leaflet', 'leaflet'], 
  
  // CRITICAL: Prisma v7 + Turbopack fix
  serverExternalPackages: ['@prisma/client', 'pg', '@prisma/adapter-pg'],
};

export default nextConfig;