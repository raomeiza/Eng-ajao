if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let d={};const t=e=>s(e,o),c={module:{uri:o},exports:d,require:t};i[o]=Promise.all(n.map((e=>c[e]||t(e)))).then((e=>(r(...e),d)))}}define(["./workbox-1be04862"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-BVMKXdMO.js",revision:null},{url:"assets/index-V0qv2W4B.js",revision:null},{url:"index.html",revision:"7fe4b98dd2872321ab2e91abbd86a965"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"favicon.ico",revision:"62478f71899787a63f6fa6283c640ffd"},{url:"s-iot-144x144.png",revision:"d2b3e4ee9732ca0a500f970ffb18b6da"},{url:"s-iot-192x192.png",revision:"bbcba17c5c78d121ac30266d288a19aa"},{url:"s-iot-36x36.png",revision:"55436cabed2cf4c022e79bf30982d3fa"},{url:"s-iot-384x384.png",revision:"0d2e4b490a1f11c23ce6f0b48fa07ff3"},{url:"s-iot-48x48.png",revision:"d1fc01e4d20b7dbd20661c64b4be2a0a"},{url:"s-iot-512x512.png",revision:"4bc381cd11f981eeea26fb998be22c07"},{url:"s-iot-72x72.png",revision:"b8a3d042a7bf27068160a7902749bd8d"},{url:"s-iot-96x96.png",revision:"91890e5f158799f704956a9eb96b66c3"},{url:"manifest.webmanifest",revision:"a6d7d567c3b285c9c32109ce2310d851"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
