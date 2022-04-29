
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
