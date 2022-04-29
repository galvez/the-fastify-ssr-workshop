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
    const csr = req.query.csr === '1'
    const { ctx, app, router } = await createApp({
      csr,
      todoList: fastify.todoList,
    })
    if (!csr) {
      router.push(url)
      await router.isReady()
      const element = await renderToString(app, ctx)
      return {
        ssrContext: JSON.stringify(ctx),
        element,
      }
    } else {
      return {
        ssrContext: JSON.stringify(ctx),
        element: null,
      }
    }
  }
}
