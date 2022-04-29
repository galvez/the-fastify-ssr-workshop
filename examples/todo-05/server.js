
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
