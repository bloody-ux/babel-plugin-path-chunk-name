# babel-plugin-path-chunk-name

<p>
  <a href="https://www.npmjs.com/package/babel-plugin-path-chunk-name">
    <img src="https://img.shields.io/teamcity/codebetter/bt428.svg" alt="Build Status" />
  </a>

  <a href="https://www.npmjs.com/package/babel-plugin-path-chunk-name">
    <img src="https://img.shields.io/npm/l/express.svg" alt="License" />
  </a>

  <a href="https://www.npmjs.com/package/babel-plugin-path-chunk-name">
    <img src="https://img.shields.io/badge/dependencies-none-brightgreen.svg" alt="No Dependencies" />
  </a>
</p>


## Why we need this?

- By default, webpack will generate dynamic chunks named with numeric value, say `0.js`.
- It's troublesome to add magic comments: `webpackChunkName` to every dynamic imports.
- It's not easy to use `webpack.NamedChunksPlugin`.
- Most of the time, we just want to keep the folder structure for dynamic chunks to easy debugging.

## Installation

### yarn
```
yarn add babel-plugin-path-chunk-name
```

### npm 
```
npm install babel-plugin-path-chunk-name
```

*.babelrc:*
```js
{
  "plugins": ["path-chunk-name"]
}
```


## What it does
Taking from the [test snapshots](./__tests__/__snapshots__/index.js.snap), it does this:

```js
import(/* webpackPrefetch: true */"./Foo")

      ↓ ↓ ↓ ↓ ↓ ↓

import(/* webpackPrefetch: true , webpackChunkName: 'Foo'*/"./Foo");
```

And if you're using dynamic imports:

```js
import(`./base/${page}`)

      ↓ ↓ ↓ ↓ ↓ ↓

import(/* webpackChunkName: 'base/[request]' */`./base/${page}`);
```

And if with `delay` opts enabled

```js

import(\\"./Foo\\")

      ↓ ↓ ↓ ↓ ↓ ↓

() => import(/* webpackChunkName: 'Foo' */"./Foo");

```

> For more usages, please find the detail in `./__tests__/index.js`

## Options

`delay`： tells whether convert import expression to arrow function.

Say, `import('./xxx')` => `() => import(/* webpackChunkName: 'xxx' */'./xxx')`

But since `1.2.0` version, calling `then` method after importing will ignore `lazy`.

Say `import('./xxxx').then(yyyy)` => `import(/* webpackChunkName: 'xxxx'*/'./xxxx').then(yyyy)`

And since `1.3.0` version, if import is already in delay mode, say `() => import('./foo')`， `delay` will do nothing.

