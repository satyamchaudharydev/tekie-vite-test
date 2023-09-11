import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr' 


export default ({ mode }) => {

  return defineConfig({
    plugins: [react({
      include: "**/*.jsx",
    }),
      svgr(),
      
    ],
    optimizeDeps: {
      build: {
        chunkSizeWarningLimit: 1000, // Set your desired limit in kilobytes
      },
      esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
              global: 'globalThis',
          },
      },
  },
  });
}
