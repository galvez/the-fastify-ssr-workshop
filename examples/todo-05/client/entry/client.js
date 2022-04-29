import { createApp } from './app'
const { app, router } = await createApp()

await router.isReady()

app.mount('main')
