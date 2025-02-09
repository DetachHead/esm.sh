import localforage from '/localforage'
import createESMWorker from '/esm-worker'
import init, { HTMLRewriter } from '/lol-html-wasm'
import lolHtmlWasm from '/lol-html-wasm/lol_html_wasm_bg.wasm?module'
import compilerWasm from '/esm-worker/compiler/pkg/esm_worker_compiler_bg.wasm?module'

init(lolHtmlWasm)
self.HTMLRewriter = HTMLRewriter

self.appStorage = {
  readFile: name => localforage.getItem(`file-${name.replace('/embed/playground/', '')}`)
}

const esmWorker = createESMWorker({
  isDev: true,
  compilerWasm
})

self.addEventListener('install', e => {
  console.log('sw->install')
  if (location.hostname === 'localhost') {
    e.waitUntil(self.skipWaiting())
  }
})

self.addEventListener('activate', e => {
  console.log('sw->activate')
})

let fetchCounter = 0

self.addEventListener('fetch', e => {
  console.log(`sw->fetch [${++fetchCounter}]`, e.request.url)
  const { pathname } = new URL(e.request.url)
  if (pathname.startsWith('/embed/playground/') && pathname !== '/embed/playground/sw.js') {
    e.respondWith(esmWorker.fetch(e.request))
  }
})
