import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Дозволяє доступ до сервера ззовні
    port: 5173, // Порт сервера
    strictPort: true, // Гарантує використання зазначеного порту
  },
});
