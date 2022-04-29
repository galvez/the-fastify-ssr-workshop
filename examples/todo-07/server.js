
export const decorate = {
  cache: {},
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report'
  ]
}

export default ({ app }) => {
  app.post('/add', (req, reply) => {
    app.todoList.push(req.body.item)
    app.cache[new URL(req.headers.referer).pathname] = undefined
    reply.send(0)
  })
}
