import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(__dirname, '..')
const commonCssSrc = path.join(pluginRoot, 'resources', 'common.css')
const bgLoaderSrc = path.join(pluginRoot, 'resources', 'bg-loader.js')
const commonCss = fs.readFileSync(commonCssSrc, 'utf8')
const bgLoader = fs.readFileSync(bgLoaderSrc, 'utf8')

export function injectAssets(htmlContent) {
  htmlContent = htmlContent.replace('<!-- COMMON_CSS -->', `<style>${commonCss}</style>`)
  htmlContent = htmlContent.replace('<!-- BG_LOADER -->', `<script>${bgLoader}</script>`)
  return htmlContent
}
