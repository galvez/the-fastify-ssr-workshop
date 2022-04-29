import { createApp } from './app'
const { app, router } = await createApp(window.ssrContext)

await router.isReady()

app.mount('main')
