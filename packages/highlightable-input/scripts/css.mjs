import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import fg from 'fast-glob'
import { transform } from 'lightningcss'

function resolve(...segments) {
  return url.fileURLToPath(new URL(path.join(...segments), import.meta.url))
}

const ROOT_DIR = resolve('..')
const STYLES_DIR = resolve(ROOT_DIR, 'src/styles')
const OUT_DIR = resolve(ROOT_DIR, 'dist')
const THEMES_OUT_DIR = resolve(OUT_DIR, 'themes')

fs.mkdirSync(THEMES_OUT_DIR, { recursive: true })

fg.sync('**/*.css', { cwd: STYLES_DIR }).forEach((file) => {
  const { code } = transform({
    filename: path.join(STYLES_DIR, file),
    code: fs.readFileSync(path.join(STYLES_DIR, file)),
    minify: true
  })

  fs.writeFileSync(path.join(OUT_DIR, file), code, 'utf8')
})
