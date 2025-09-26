import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'], // ponto de entrada principal
  outDir: 'dist', // pasta de saída dos artefatos
  bundle: true, // agrupa todo o código em um bundle
  platform: 'node', // otimizado para Node.js
  target: 'es2022', // aproveita features do Node 18+
  format: ['esm'], // gera módulos ES (pode adicionar 'cjs')
  clean: true, // limpa dist/ antes de cada build
  sourcemap: true, // desativa source maps em produção
  minify: false, // reduz tamanho e ofusca o bundle
  dts: false,
  splitting: true 
})