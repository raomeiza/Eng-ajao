// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Secure IOT',
        short_name: 'Secure IOT',
        description: 'Secure IOT App',
        theme_color: '#b647f7',
        background_color: '#ffffff',
        icons: [
          {
            src: 's-iot-36x36.png',
            sizes: '36x36',
            type: 'image/png',
          },
          {
            src: 's-iot-48x48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: 's-iot-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 's-iot-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 's-iot-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 's-iot-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 's-iot-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 's-iot-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicon.ico',
            sizes: '16x16 32x32',
            type: 'image/x-icon',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, '..', 'server', 'public'),
  }
});
