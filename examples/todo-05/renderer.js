import { renderToString } from '@vue/server-renderer'
import { compile } from 'tempura'

export default {
  serverEntryPoint: '/entry/server.js',
  clientEntryPoint: '/entry/client.js',
  compileIndexHtml,
  createRenderFunction,
}

function compileIndexHtml (source) {
  const template = compile(source)
  return (req, ctx) => template(ctx)
}

function createRenderFunction (createApp) {
  return async function (fastify, req, reply, url, config) {
    const { renderer } = config
    const { ctx, app, router } = await createApp({
      todoList: fastify.todoList,
    })
    router.push(url)
    await router.isReady()
    const element = await renderToString(app, ctx)
    return {
      ssrContext: JSON.stringify(ctx),
      entry: renderer.clientEntryPoint,
      element,
    }
  }
}
