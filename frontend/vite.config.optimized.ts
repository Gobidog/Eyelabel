import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-fabric': ['fabric'],
          'vendor-ag-grid': ['ag-grid-community', 'ag-grid-react'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-utils': ['axios', 'date-fns', 'papaparse'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
  },
});
