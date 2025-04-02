/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'raw.githubusercontent.com',
            port: '', // Deja vacío si no usas un puerto específico
            pathname: '/PokeAPI/sprites/**', // Permite todas las rutas bajo /PokeAPI/sprites
          },
        ],
      },
};

export default nextConfig;
