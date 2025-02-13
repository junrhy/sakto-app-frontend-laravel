import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        hmr: {
            host: '127.0.0.1',
            protocol: 'ws'
        },
        watch: {
            usePolling: true
        },
        port: 5173,
        strictPort: true,
    },
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',
            ],
            refresh: true,
        }),
        react(),
    ],
    define: {
        'process.env.API_URL': JSON.stringify(process.env.API_URL),
        'process.env.API_TOKEN': JSON.stringify(process.env.API_TOKEN),
    },
});
