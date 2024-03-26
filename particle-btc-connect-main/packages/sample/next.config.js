/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export',
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|png|wasm|data)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=9999999999, must-revalidate',
                    }
                ],
            },
            {
                source: '/:all*(js)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store',
                    }
                ],
            },
        ]
    },
};

module.exports = nextConfig;
