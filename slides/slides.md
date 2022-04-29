---
theme: slidev-theme-nearform
layout: image-right
image: /images/cover.jpeg
highlighter: shiki
lineNumbers: false
---

<img class=logo src="/images/nearform.svg">

# The Fastify<br>**SSR** Workshop

<div class="copyright">

© Copyright 2019-2022 NearForm Ltd. All Rights Reserved.

<small>Cover by @simonppt via <a href="https://unsplash.com/@simonppt">Unsplash</a></small>

</div>

---

# What is SSR?

# **Server-Side Rendering**<br>
## comprises various techniques involved in<br><br>
## **running client-side JavaScript on the server**<br><br> 
## in order to **pregenerate markup for delivery**<br><br>
## prior to page load.

---

# Why SSR? (1)

# **It's not just about search engines.**<br>

## **SSR improves user experience**: users don't have to wait for CPU-bound JavaScript to run on the client before they can see anything. Thus we get:<br><br>

- faster **First Paint** (**FP**) 
- faster **First Contentful Paint** (**FCP**)
- faster **Time to Interactive** (**TTI**)

---

# Why SSR? (2)

- no **extra round-trips** for data fetching and templating
- use JavaScript **universally** for backend and frontend
- and a lot of JavaScript can **stay on the server**
- **static site generation** also becomes easier

## See **Rendering on the Web** <small>by Addy Osmani and Jason Miller</small>:
**https://developers.google.com/web/updates/2019/02/rendering-on-the-web**

---

# Why Not SSR?

- SSR is ideal for **dynamic**, **data-dependent** applications
  - There's an added cost of running live application servers
  - Avoid if hosting API-backed SPA is more cost efficient
- Avoid if you can just pregenerate (statically render) everything
- Can also consider hybrid setups
  - SSR for some pages, static delivery for others

---

# Sources

## **[github.com/nearform/the-fastify-ssr-workshop](https://github.com/nearform/the-fastify-ssr-workshop)**<br><br>

### `git clone git@github.com:nearform/the-fastify-ssr-workshop.git`<br><br>

### `cd examples && npm install && npx zx install.mjs`

This will preinstall all dependencies for all examples.

---

# ToDo List (1)

## Let's build a **simple To-Do list**.<br><br>
## A really, really simple one. It won't do anything.<br><br>
## It'll just really be displayed.<br><br>
## **Let's do JavaScript like it's 2012 for a bit**.

---

# ToDo List (1)

1. `cd examples/todo-01`
2. `node server.js`
3. Hit `http://localhost:3000`

---

# ToDo List (1)

## Here's a bit of **EJS** for rendering a list:

`examples/todo-01/client.html`

```html
<ul>
<% for (const item of todoList) { %>
<li><%= item %></li>
<% } %>
</ul>
```

---

# ToDo List (1)

`examples/todo-01/server.js`

```js {all|7-8,10,14}
import Fastify from 'fastify'
import Template from 'lodash.template'
import { readFile } from 'fs/promises'

const app = Fastify({ logger: true })

const template = await readFile('./app.html', 'utf8')
const render = Template(template)

const todoList = ['Do laundry', 'Respond to emails', 'Write report']

app.get('/', (_, reply) => {
  reply.type('text/html')
  reply.send(render({ todoList }))
})

await app.listen(3000)
```

---

# ToDo List (1)

<img src="/assets/todo-list-step-01.png" style="width: 80%">

---

# SSR is a misnomer

## **This is not the SSR we're talking about today**<br><br>

- Well, technically, yes, we're server-side rendering markup.
- But we're **still using EJS on the server**.
- We're **not rendering client-side JavaScript on the server** yet.

---

# ToDo List (2)

## Before we do real SSR, let's **get a bit fancy**.<br><br>
## Let's add an input to add items to the list.<br><br>
## Better still: let's _AJAX_ it to the server.<br><br>
## The user should **see the item added immediately**.<br><br>
## But if the page is refreshed,
## any items previously added **should still load**.<br><br>

---

  # ToDo List (2)

  1. `cd examples/todo-02`
  2. `node server.js`
  3. Hit `http://localhost:3000`

---

# ToDo List (2)

## Now our template includes an input and a button:

`examples/todo-02/client.html`

```html
<ul>
<% for (const item of todoList) { %>
<li><%= item %></li>
<% } %>
</ul>
<input>
<button>Add</button>
```

---

# ToDo List (2)

## And also a bit of JavaScript at the end:<br><br>

```html
<script>
document.querySelector('button').addEventListener('click', async () => {
  const item = document.querySelector('input').value
  const response = await fetch('/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item })
  })
  const status = await response.json()
  if (status === 0) {
    const li = document.createElement('li')
    li.innerText = item
    document.querySelector('ul').appendChild(li)
    document.querySelector('input').value = ''
  }
})
</script>
```

---

# ToDo List (2)

## Accompanied by one extra endpoint on the server:<br><br>

```js
app.post('/add', (req, reply) => {
  todoList.push(req.body.item)
  reply.send(0)
})
```
<br>

## This way we can update the server's live 
## `todoList` array when we update it on the client.

---

# ToDo List (2)

## **Key considerations**:<br><br>

- The code that generates the markup can only run on the server
- We have to manually update the DOM with new data

---

# ToDo List (3)

## Time to do some **_real SSR_** for client JavaScript code.<br><br>
## We'll use **happy-dom**, a small and fast SSR library.<br><br>

- **Drop EJS templates** in favor of DOM-flavored JavaScript
- Do **model-based rendering** of the To-Do list
- **Prevent rendering it twice** on first load
- **Share an ES module** between client and server

---

# ToDo List (3)

1. `cd examples/todo-03`
2. `node server.js`
3. Hit `http://localhost:3000`

---

# ToDo List (3)

## We begin by splitting `client.html` into:<br>

- `client.html` (left) for the client-only bootstrap script
- `client.js` (right) for shared (universal) ES module and

<div class="flex flex-row w-full justify-evenly gap-10">

```html
<script type="module">
import {
  render,
  addEventListeners
} from './client.js'
render(document, window)
addEventListeners()
</script>
```

```js
export function render (document, { todoList }) {
  let html = '<ul>'
  for (const item of todoList) {
    html += `<li>${item}</li>`
  }
  html += '</ul><input>'
  html += '<button>Add</button>'
  document.body.innerHTML = html
}
```

</div>

- `addEventListeners()` just registers the button listener code


---

# ToDo List (3)

`examples/todo-03/server.js`

```js
import { Window } from 'happy-dom'
import { render } from './client.js'

const html = await readFile('./client.html', 'utf8')

app.get('/client.js', (_, reply) => {
  reply.type('text/javascript')
  reply.send(createReadStream('./client.js'))
})

app.get('/', (_, reply) => {
  const window = new Window()
  const document = window.document
  reply.type('text/html')
  render(document, { todoList })
  reply.send(`${html}${document.body.innerHTML}`)
})
```

---

# ToDo List (3)

`examples/todo-03/client.js`

```js {1-2,5-10}
let isClient = typeof window !== 'undefined'
let isFirstRender = true

export function render (document, { todoList }) {
  if (isClient && isFirstRender) {
    isFirstRender = false
    fetch('/data').then(r => r.json())
      .then((json) => { window.todoList = json })
    return
  }
  let html = '<ul>'
  for (const item of todoList) {
    html += `<li>${item}</li>`
  }
  html += '</ul><input>'
  html += '<button>Add</button>'
  document.body.innerHTML = html
}
```

---

# ToDo List (3)

`examples/todo-03/client.js`

```js
export function addEventListeners () {
  document.querySelector('button')
    .addEventListener('click', async () => {
      const item = document.querySelector('input').value
      window.todoList.push(item)
      const response = await fetch('/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item })
      })
      const status = await response.json()
      if (status === 0) {
        render(document, window)
      }
    })
}
```

---

# ToDo List (3)

## **Key considerations**:<br><br>

- Markup is **generated by JavaScript**
  - This could be a Vue or JSX template
- The HTML list is always rendered based on `todoList`
  - As opposed to an individual list item being added every time
  - Note however a full render occurs every time the list is updated
  - Frameworks take care of updating the DOM for you efficiently

---

# ToDo List (3)

- On page load, no JavaScript needs to run to get the HTML
  - `window.todoList` is then _hydrated_ from the server
  - so `render(document, window)` will work on the client
- `render()` from `client.js` is **universal**: 
  - **seamlessly shared** between client and server

---

# **This is why SSR frameworks exist**

- Popular SSR frameworks: **Nuxt.js**, **Next.js** and **Remix**
- Frameworks take care of hot reloading and bundling client code
  - Both for development and production
- Frameworks take care of routing and hydration automatically
  - And making your code universally runnable (client and server)
- Do we really need a SSR framework though?

---

# **Escaping the SSR framework route**

- _Frameworks take care of hot reloading and bundling client code_
  - _Both for development and production_
  - **We can just use Vite for that**
- _Frameworks take care of routing and hydration automatically_
  - _And making your code universally runnable (client and server)_
  - **We can take care of that at the application level**

# Let's get Fastify and Vite playing together!

---

# **Technology Preview**

<img src="/images/dx.svg" style="width: 90%;">

---

# **Fastify DX**

- Being designed as a **fully ejectable** framework
  - You'll be able to run `dx eject` and get everything in your project
- **Simplicity** and **minimalism** in mind
  - Don't introduce arbitrary new runtime or API
  - Focus on **smart, configurable glue code**
- Makes it easier to run **any** Fastify app
- Makes it even easier to **integrate with Vite** for SSR

---

# **Fastify DX in a nutshell**

<div class="flex flex-row w-full justify-evenly gap-10">

```js
import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.decorate('todoList', [
  'Do laundry',
  'Respond to emails',
  'Write report'
])

app.post('/add', (req, reply) => {
  app.todoList.push(req.body.item)
  reply.send(0)
})

await app.listen(3000)
```

```js
export const decorate = {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report'
  ]
}

export default ({ app }) => {
  app.post('/add', (req, reply) => {
    app.todoList.push(req.body.item)
    reply.send(0)
  })
}

export const port = 3000
```

</div>

---

# **Fastify DX**

- A lot like `fastify-cli` minus a few features (for now)
- Instead of operating on individual files like `fastify-cli`
- Fastify DX operates on folders with a `server` and `client` module
- It will always look for a `server.js` or `server.mjs` file
  - TypeScript support will be added afterwards
- It will automatically load `vite.config.js`
 - As long as you **define a renderer**

---

# ToDo List (4)

1. `cd examples/todo-04`
2. `npx dx dev`
3. Hit `http://localhost:3000`

---

# ToDo List (4)

`examples/todo-04/server.js`

```js
export const decorate = {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report'
  ]
}

export default ({ app }) => {
  app.post('/add', (req, reply) => {
    app.todoList.push(req.body.item)
    reply.send(0)
  })
}
```

---

# ToDo List (4)

`examples/todo-04/renderer.js`

```js
export default {
  serverEntryPoint: '/entry/server.js',
  clientEntryPoint: '/entry/client.js',
  compileIndexHtml,
  createRenderFunction,
}
```

- `compileIndexHtml` precompiles Vite's `index.html` for SSR
  - So we can dynamically add anything else we might need
- `createRenderFunction(createApp)` creates a `render()` function
  - Based on the function that creates your (client) app

---

# ToDo List (4)

`examples/todo-04/renderer.js`

```js
import { compile } from 'tempura'

function compileIndexHtml (source) {
  const template = compile(source)
  return (req, ctx) => template(ctx)
}
```

- I'm using Luke Edwards' lovely templating language `tempura`
  - https://github.com/lukeed/tempura
- You can use anything you want!

---

# ToDo List (4)

`examples/todo-04/renderer.js`

```js {all|5|7|9|10|11|12|all}
import { renderToString } from '@vue/server-renderer'

function createRenderFunction (createApp) {
  return async function (fastify, req, reply, url, config) {
    const { renderer } = config // Get renderer config
    const { ctx, app, router } = await createApp({
      todoList: fastify.todoList, // Get decorated data object
    })
    router.push(url) // Push URL to VueRouter
    await router.isReady() // Wait for route to render
    const element = await renderToString(app, ctx) // Vue SSR!
    return { // Return variables to indexHtml template function
      entry: renderer.clientEntryPoint,
      element,
    }
  }
}

```


---

# ToDo List (4)

`examples/todo-04/client/index.html`

```
{{#expect element, entry }}
<!DOCTYPE html>
<main>{{{ element }}}</main>
<script 
  type="module"
  src="{{{ entry }}}">
</script>
```

---

# ToDo List (4)

`examples/todo-04/client/index.vue`

```vue
<template>
  <ul>
    <li v-for="item in todoList">{{ item }}</li>
  </ul>
  <input v-model="item">
  <button @click="addItem">Add</button>
</template>
```
<br>

## _Now_, that's much better!

---

# ToDo List (4)

`examples/todo-04/client/index.vue`

```js
import ky from 'ky-universal'
import { reactive, ref, useSSRContext } from 'vue'

export default {
  setup () {
    const { todoList: raw } = useSSRContext()
    const todoList = reactive(raw)
    const item = ref('')
    const addItem = async () => {
      const json = { item: item.value }
      const status = await ky.post('/add', { json }).json()
      todoList.push(item.value)
      item.value = ''
    }
    return { todoList, item, addItem }
   }
}
```

---

# ToDo List (4)

`examples/todo-04/client/entry/server.js`

```js
import { createApp } from './app'

export default (createRenderFunction) => ({
  routes: [{ path: '/*' }],
  render: createRenderFunction(createApp),
})
```

---

# ToDo List (4)

`examples/todo-04/client/entry/client.js`

```js
import { createApp } from './app'
const { app, router } = await createApp()

await router.isReady()

app.mount('main')
```

---

# ToDo List (4)

`examples/todo-04/client/entry/app.js`

```js
const createHistory = import.meta.env.SSR
  ? createMemoryHistory
  : createWebHistory

export async function createApp (ctx) {
  const app = createSSRApp(App)
  const router = createRouter({
    history: createHistory(),
    routes: [
      { path: '/', component: Index },
    ],
  })
  app.use(router)
  return { ctx, app, router }
}
```

_Imports redacted for brevity._

---

# ToDo List (4)

<span style="font-size: 2em">🎉</span>
<img src="/images/04.png" style="width: 70%">

---

# ToDo List (4)

<span style="font-size: 2em">🤔</span>
<img src="/images/04-bug.png" style="width: 90%">

---

# ToDo List (4)

## Can you debug this?<br><br>

- Vue's `setup()` is called on both server and client
  - But `useSSRContext()` can only run on the server
- Our Vue component needs `todoList` to render

## **What's missing?**<br><br>

---

# ToDo List (4)

## **What's missing?**<br><br>

- **Next.js** takes care of this automatically: `getServerSideProps()`
- **Nuxt.js** takes care of this automatically: `asyncData()`
- **Remix** takes care of this automatically: `useLoaderData()`

---

<div style="opacity: 0.5">

# ToDo List (4)

## **What's missing?**<br><br>

- **Next.js** takes care of this automatically: `getServerSideProps()`
- **Nuxt.js** takes care of this automatically: `asyncData()`
- **Remix** takes care of this automatically: `useLoaderData()`

</div>

## <br><br>**Client-Side Data Hydration!**


---

# ToDo List (4)

## Can you debug this?<br><br>

- **Hint**: `examples/todo-03` also takes care of that!
- **Hint**: you can leverage `compileIndexHtml()`
- **Hint**: you'll need to tweak the Vue component `setup()` a little

---

# ToDo List (5)

1. `cd examples/todo-05`
2. `npx dx dev`
3. Hit `http://localhost:3000`

---

# ToDo List (5)

`examples/todo-04/client/index.html`

```diff
- {{#expect element, entry }}
+ {{#expect ssrContext, element, entry }}
  <!DOCTYPE html>
+ <script>
+ window.ssrContext = {{{ ssrContext }}};
+ </script>
  <main>{{{ element }}}</main>
  <script 
    type="module"
    src="{{{ entry }}}">
  </script>
```

---

# ToDo List (5)

`examples/todo-04/renderer.js`

```diff
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
+       ssrContext: JSON.stringify(ctx),
        entry: renderer.clientEntryPoint,
        element,
      }
    }
  }
```


---

# ToDo List (5)

`examples/todo-04/renderer.js`

```diff
  export default {
    setup () {
-     const { todoList: raw } = useSSRContext()
+     const { todoList: raw } = import.meta.env.SSR ? useSSRContext() : window.ssrContext
      const todoList = reactive(raw)
      const item = ref('')
      const addItem = async () => {
        const json = { item: item.value }
        const status = await ky.post('/add', { json }).json()
        todoList.push(item.value)
        item.value = ''
      }
      return { todoList, item, addItem }
     }
  }
```

---

# Scaling SSR with Fastify

## No matter what framework you choose, SSR is expensive.<br><br>
## At scale, it takes a lot of CPU/memory to stay fast.<br><br>
## **There are two obvious things we can do.**<br><br>

---

<div style="opacity: 0.5">

# Scaling SSR with Fastify

## No matter what framework you choose, SSR is expensive.<br><br>
## At scale, it takes a lot of CPU/memory to stay fast.<br><br>
## **There are two obvious things we can do.**<br><br>

</div>

## **Fallback to CSR** whenever needed would be nice!<br><br>

---

<div style="opacity: 0.5">

# Scaling SSR with Fastify

## No matter what framework you choose, SSR is expensive.<br><br>
## At scale, it takes a lot of CPU/memory to stay fast.<br><br>
## **There are two obvious things we can do.**<br><br>

</div>

## **Fallback to CSR** whenever needed would be nice!<br><br>
## And of course, we can **cache SSR responses.**

---

<div class="middle-flex items-center w-full">

<img src="/images/matteo.png" style="width: 50%;">

</div>

---

# **Can you add fallback to CSR?**

- Start with a copy of `examples/todo-05`.
- **Hint**: For CSR fallback we still need to server data (`ssrContext`)
- **Hint**: Vue exports `createApp` and `createSSRApp` functions<br>
- **Solution**: `examples/todo-06`
- **Files changed**:
  - `renderer.js`
  - `client/index.html`
  - `client/entry/app.js`

---

# **Can you add caching to SSR responses?**

- Start with a copy of `examples/todo-05`.
- **Hint**: Fastify has `onRequest` and `onSend` hooks
- **Hint**: You can cache the render function directly though
- **Solution**: `examples/todo-07`
- **Files changed**:
  - `renderer.js`
  - `server.js`

---

# Thank you!

- Follow me on Twitter 😊
  - **[@anothergalvez](https://twitter.com/anothergalvez)**
- Fastify DX Status
  - Under **active development**
  - Good right now for **playing in dev mode**
  - Deployment **build and documention still WIP**
  - Subscribe to the newsletter to get on the public beta 🔥
    - **[https://www.getrevue.co/profile/fastify-dx](https://www.getrevue.co/profile/fastify-dx)**
