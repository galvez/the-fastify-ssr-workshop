import { createApp } from './app'
const { app, router } = await createApp(window.ssrContext)

router.isReady().then(() => app.mount('main'))
