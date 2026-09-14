import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev
export default defineConfig(({ command }) => ({
  // Base-polku pitää vastata GitHub-arkistosi nimeä
  base: '/barcode-scanner/', 
  plugins: [
    react(),
    // Käytetään SSL:ää vain, kun ajetaan 'npm run dev' paikallisesti
    command === 'serve' ? basicSsl() : null 
  ],
}))
