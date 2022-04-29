import { compile } from 'tempura'
const t = `
{{#expect ssrContext, element, entry }}
<!DOCTYPE html>
<script>
window.ssrContext = {{{ ssrContext }}};
</script>
{{#if element}}
  <main>{{{ element }}}</main>
{{#else}}
  <main></main>
{{/if}}
<script 
  type="module"
  src="{{{ entry }}}">
</script>
`

const f = compile(t)

console.log(f({
  ssrContext: {},
  element: '<div></div>',
  entry: '/foobar/foobar.js',
}))