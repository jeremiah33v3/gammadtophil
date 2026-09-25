import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import favicon from './assets/Gammad_Icon_Transparent.png'

document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', favicon)
history.scrollRestoration = 'manual'
if (window.location.hash) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
window.scrollTo(0, 0)

createApp(App).mount('#app')
