import Fastify from 'fastify'
import Template from 'lodash.template'
import { readFile } from 'fs/promises'

const app = Fastify({ logger: true })

const template = await readFile('./client.html', 'utf8')
const render = Template(template)

const todoList = ['Do laundry', 'Respond to emails', 'Write report']

app.get('/', (_, reply) => {
  reply.type('text/html')
  reply.send(render({ todoList }))
})

app.post('/add', (req, reply) => {
  todoList.push(req.body.item)
  reply.send(0)
})

await app.listen(3000)
