#  Save each script to a file: setup-mapping.sh
# Make them executable:
#       chmod +x setup-mapping.sh

# Run the script:
#       ./setup-mapping.sh



#!/bin/zsh

echo "🗺️ Creating Indigenous Mapping Application structure..."

# Create root directory
mkdir -p indigenous-mapping
cd indigenous-mapping

# Initialize with Vite
npm create vite@latest . -- --template react

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/assets/{textures,models,shaders}
mkdir -p src/components/{Map,UI,Three}
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/data/territories
mkdir -p public/assets/{geojson,textures}

# Create Map components
touch src/components/Map/MapScene.jsx
touch src/components/Map/Controls.jsx
touch src/components/Map/MapLayers.jsx
touch src/components/Map/TerrainLayer.jsx

# Create UI components
touch src/components/UI/Sidebar.jsx
touch src/components/UI/TimelineSlider.jsx
touch src/components/UI/LegendPanel.jsx
touch src/components/UI/InfoBox.jsx

# Create Three components
touch src/components/Three/Scene.jsx
touch src/components/Three/TerrainMesh.jsx
touch src/components/Three/TerritoryBoundaries.jsx
touch src/components/Three/Markers.jsx

# Create hooks
touch src/hooks/useMap.js
touch src/hooks/useGeoData.js
touch src/hooks/useThree.js
touch src/hooks/useControls.js

# Create services
touch src/services/mapService.js
touch src/services/geoDataService.js
touch src/services/threebox.js

# Create utils
touch src/utils/geoTransform.js
touch src/utils/terrainCalculations.js
touch src/utils/colorScales.js
touch src/utils/mapHelpers.js

# Create sample data files
touch src/data/territories/navajo.json
touch src/data/territories/hopi.json
touch src/data/territories/zuni.json
touch src/data/index.js

# Create Vite config
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import glsl from 'vite-plugin-glsl'

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
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'react-three-fiber': ['@react-three/fiber', '@react-three/drei'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    open: true,
    port: 3000,
    hmr: true,
  },
  optimizeDeps: {
    include: [
      'three', 
      '@react-three/fiber', 
      '@react-three/drei',
      'mapbox-gl', 
      '@turf/turf',
    ],
  },
})
EOL

# Create .env file for Mapbox API key
echo "VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here" > .env

# Create README content
cat > README.md << 'EOL'
# Indigenous Mapping Application

A 3D geographic visualization of historical indigenous territories using React Three Fiber and Mapbox.

## Setup

1. Clone this repository
2. Run `npm install`
3. Add your Mapbox API key to the `.env` file
4. Run `npm run dev` to start the development server
EOL

# Install dependencies
echo "📦 Installing dependencies..."
npm install three @react-three/fiber @react-three/drei mapbox-gl react-map-gl @turf/turf d3-scale react-router-dom
npm install --save-dev path vite-plugin-glsl terser

echo "✅ Indigenous Mapping application structure created successfully!"
cd ..