import { createSSRApp, createApp as createCSRApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import App from './app.vue'
import Index from '../index.vue'

const routes = [
  { path: '/', component: Index },
]

export async function createApp (ctx) {
  let app
  let history
  if (ctx.csr) {
    if (import.meta.env.SSR) {
      return { ctx }
    } else {
      app = createCSRApp(App)
      history = createWebHistory()
    }
  } else {
    app = createSSRApp(App)
    history = createMemoryHistory()
  }
  const router = createRouter({ history, routes })
  app.use(router)
  return { ctx, app, router }
}
