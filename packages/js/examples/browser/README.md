# Browser example

`index.html` shows the intended import surface. Bundle `@ckvf/browser` with Vite/esbuild before serving; raw browsers cannot resolve npm package names.

Private keys must not be logged. This example writes only the encrypted container to the page.
