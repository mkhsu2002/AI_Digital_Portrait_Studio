import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // GitHub Pages 部署時，如果倉庫名稱不是 username.github.io，需要設定 base path
    // 例如：如果倉庫名稱是 'AI_Digital_Portrait_Studio'，base 應該是 '/AI_Digital_Portrait_Studio/'
    // 可以透過環境變數 VITE_BASE_PATH 來設定，預設為 '/'
    const base = env.VITE_BASE_PATH || '/';
    
    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 確保建置輸出目錄正確
        outDir: 'dist',
        // 產生 source map（可選，用於除錯）
        sourcemap: false,
        // 優化建置
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            },
          },
        },
      },
    };
});
