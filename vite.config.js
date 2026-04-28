import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({

  build: {
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  plugins: [
    viteImagemin({
      mozjpeg: { quality: 70 },
      pngquant: { quality: [0.6, 0.8] },
      webp: { quality: 75 }
    })
  ]
})