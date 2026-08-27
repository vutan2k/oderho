import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'run-scraper-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/run-scraper' && req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json');
            
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            
            req.on('end', () => {
              let maxProducts = 10;
              let headless = true;
              try {
                const parsed = JSON.parse(body);
                if (parsed.maxProducts) maxProducts = parsed.maxProducts;
                if (parsed.headless !== undefined) headless = parsed.headless;
              } catch {}

              console.log(`🚀 [Vite Backend API] Kích hoạt cào: MAX=${maxProducts}, HEADLESS=${headless}`);
              
              // Chạy lệnh trong terminal cục bộ chạy ngầm
              const cmd = `export MAX_PRODUCTS=${maxProducts} HEADLESS=${headless} && node scripts/playwright_ai_scraper.js`;
              exec(cmd, (error, stdout, stderr) => {
                if (error) {
                  console.error(`❌ [Vite Backend API] Lỗi cào ngầm:`, error);
                } else {
                  console.log(`✅ [Vite Backend API] Tiến trình cào ngầm hoàn tất!`);
                }
              });

              res.writeHead(200);
              res.end(JSON.stringify({ success: true, message: 'Đã kích hoạt cào ngầm.' }));
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) {
              return 'vendor-firebase-firestore';
            }
            if (id.includes('firebase/auth') || id.includes('@firebase/auth')) {
              return 'vendor-firebase-auth';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase-core';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-router-dom') || id.includes('react-helmet-async') || id.includes('/react/') || id.includes('/react-dom/')) {
              return 'vendor-react';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 3000,
    strictPort: true
  }
})
