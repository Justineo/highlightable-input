import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    vue: 'src/vue.ts',
    react: 'src/react.tsx'
  },
  format: ['esm'],
  external: ['vue', 'react', './index.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  dts: true
})
