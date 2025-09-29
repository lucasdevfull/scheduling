import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/main.ts'], // ponto de entrada principal
  outDir: 'dist', // pasta de saída dos artefatos
  bundle: true, // agrupa todo o código em um bundle
  platform: 'node', // otimizado para Node.js
  target: 'es2022', // aproveita features do Node 18+
  format: ['esm', 'cjs'], // gera módulos ES (pode adicionar 'cjs')
  clean: true, // limpa dist/ antes de cada build
  minify: true, // reduz tamanho e ofusca o bundle,
  external: [
    '@node-rs/bcrypt',
    // opcional: incluir platform-specific packages para evitar que o bundler tente resolvê-los
    '@node-rs/bcrypt-android-arm64',
    '@node-rs/bcrypt-darwin-arm64',
    '@node-rs/bcrypt-darwin-x64',
    '@node-rs/bcrypt-linux-x64-gnu'
  ],
  outExtension: ({ format }) => {
    if (format === 'esm') {
      return {
        js: '.mjs'
      }
    } else {
      return {
        js: '.cjs'
      }
    }
  }
})