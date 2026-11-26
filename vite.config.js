import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En GitHub Pages la app vive en https://<usuario>.github.io/uca-tickets/
// Por eso "base" lleva el nombre del repositorio. React Router toma de aquí su basename.
export default defineConfig({
  base: '/uca-tickets/',
  plugins: [react()],
});
