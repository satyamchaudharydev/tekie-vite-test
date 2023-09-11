// vite.config.js
import { defineConfig, loadEnv } from "file:///Users/uolo/Desktop/vite-project/node_modules/vite/dist/node/index.js";
import react from "file:///Users/uolo/Desktop/vite-project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgr from "file:///Users/uolo/Desktop/vite-project/node_modules/vite-plugin-svgr/dist/index.js";
var vite_config_default = ({ mode }) => {
  return defineConfig({
    plugins: [
      react({
        include: "**/*.jsx"
      }),
      svgr()
    ],
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis"
        }
      }
    }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdW9sby9EZXNrdG9wL3ZpdGUtcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3VvbG8vRGVza3RvcC92aXRlLXByb2plY3Qvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3VvbG8vRGVza3RvcC92aXRlLXByb2plY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHN2Z3IgZnJvbSAndml0ZS1wbHVnaW4tc3ZncicgXG5cblxuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9KSA9PiB7XG5cbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW3JlYWN0KHtcbiAgICAgIGluY2x1ZGU6IFwiKiovKi5qc3hcIixcbiAgICB9KSxcbiAgICAgIHN2Z3IoKSxcbiAgICAgIFxuICAgIF0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgICAgIC8vIE5vZGUuanMgZ2xvYmFsIHRvIGJyb3dzZXIgZ2xvYmFsVGhpc1xuICAgICAgICAgIGRlZmluZToge1xuICAgICAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgICAgICB9LFxuICAgICAgfSxcbiAgfSxcbiAgfSk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtSLFNBQVMsY0FBYyxlQUFlO0FBQ3hULE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFHakIsSUFBTyxzQkFBUSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRTNCLFNBQU8sYUFBYTtBQUFBLElBQ2xCLFNBQVM7QUFBQSxNQUFDLE1BQU07QUFBQSxRQUNkLFNBQVM7QUFBQSxNQUNYLENBQUM7QUFBQSxNQUNDLEtBQUs7QUFBQSxJQUVQO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixnQkFBZ0I7QUFBQTtBQUFBLFFBRVosUUFBUTtBQUFBLFVBQ0osUUFBUTtBQUFBLFFBQ1o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0EsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogW10KfQo=
