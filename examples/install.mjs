
for (const i of [1,2,3,4,5,6,7]) {
  cd(path.resolve(__dirname, `todo-0${i}`))
  await $`npm install`
}
