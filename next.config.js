/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rwfaybbuketejgtbdslc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'rwfaybbuketejgtbdslc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/avatar/**', // new avatars bucket
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },

  // Disable ESLint errors during production builds (Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
