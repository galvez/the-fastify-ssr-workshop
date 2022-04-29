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
    if (fastify.cache[url]) {
      console.log('Cache hit!')
      return fastify.cache[url]
    }
    const { ctx, app, router } = await createApp({
      todoList: fastify.todoList,
    })
    router.push(url)
    await router.isReady()
    const element = await renderToString(app, ctx)
    const payload = {
      ssrContext: JSON.stringify(ctx),
      element,
    }
    fastify.cache[url] = payload
    return payload
  }
}
