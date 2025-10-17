/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desactivar ESLint durante el build de producción
    ignoreDuringBuilds: true,
  },
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.googleusercontent.com",
      port: "",
      pathname: "**",
    },
  ],
  },
}

module.exports = nextConfig
