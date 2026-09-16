import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import favicon from './assets/Gammad_Icon_Transparent.png'

document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', favicon)

createApp(App).mount('#app')
