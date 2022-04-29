import Fastify from 'fastify'
import { createReadStream } from 'fs'
import { readFile } from 'fs/promises'
import { Window } from 'happy-dom'
import { render } from './client.js'

const app = Fastify({ logger: true })
const html = await readFile('./client.html', 'utf8')
const todoList = ['Do laundry', 'Respond to emails', 'Write report']

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

app.get('/data', (_, reply) => {
  reply.send(todoList)
})

app.post('/add', (req, reply) => {
  todoList.push(req.body.item)
  reply.send(0)
})

await app.listen(3000)
