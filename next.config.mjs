/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  async headers() {
    return [
        {
            source: '/(.*)',
            headers: [
                {
                    key: 'Content-Security-Policy',
                    value: "default-src 'self'; script-src 'self' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src * data:; font-src 'self' https://fonts.gstatic.com; object-src 'self' data:; connect-src 'self' https://script.google.com * https://timehub-api.chaincodeconsulting.com;",
                },
                {
                    key: 'Cross-Origin-Opener-Policy',
                    value: 'same-origin-allow-popups',
                },
            ],
        },
    ]
  },
};

export default nextConfig;
