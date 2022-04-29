
for (const folder of ['todo-01', 'todo-02', 'todo-03']) {
  cd(path.resolve(__dirname, folder))
  await $`npm install`
}
