import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    react(),
    glsl() // Support for importing .glsl, .vert, .frag files
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@data': path.resolve(__dirname, './src/data'),
      '@layers': path.resolve(__dirname, './src/components/Layers')
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          deck: [
            '@deck.gl/core',
            '@deck.gl/react',
            '@deck.gl/layers',
            '@deck.gl/geo-layers',
            '@deck.gl/mesh-layers'
          ],
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'mapbox-gl',
            '@turf/turf',
            'd3-scale'
          ]
        }
      }
    }
  },
  server: {
    open: true,
    port: 3000,
    hmr: true
  },
  optimizeDeps: {
    include: [
      '@deck.gl/core',
      '@deck.gl/react',
      '@deck.gl/layers',
      '@deck.gl/geo-layers',
      '@deck.gl/mesh-layers',
      'mapbox-gl',
      '@turf/turf',
      'd3-scale'
    ]
  }
});
