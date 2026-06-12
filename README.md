[![npm (scoped)](https://img.shields.io/npm/v/@xstd/signal.svg)](https://www.npmjs.com/package/@xstd/signal)
![npm](https://img.shields.io/npm/dm/@xstd/signal.svg)
![NPM](https://img.shields.io/npm/l/@xstd/signal.svg)
![npm type definitions](https://img.shields.io/npm/types/@xstd/signal.svg)

[//]: # (![coverage]&#40;https://img.shields.io/badge/coverage-100%25-green&#41;)

<picture>
  <source height="64" media="(prefers-color-scheme: dark)" srcset="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-dark.png?raw=true">
  <source height="64" media="(prefers-color-scheme: light)" srcset="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
  <img height="64" alt="Shows a black logo in light color mode and a white one in dark color mode." src="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
</picture>

## @xstd/signal

A Signal implementation based on [alien-signals](https://github.com/stackblitz/alien-signals).

## 📦 Installation

```shell
yarn add @xstd/signal
# or
npm install @xstd/signal --save
```

## 🏭 Example

```ts
import { signal, computed, batch } from '@xstd/signal';

const width = signal(10);
const height = signal(5);
const surface = computed(() => width() * height());

effect(() => {
  console.log(`surface: ${surface()}`);
});
// logs: surface: 50

batch(() => {
  // batch allows to update multiple signals at once
  width.set(20);
  height.set(10);
});
// logs: surface: 200
```


## 📜 Documentation

https://xstd-js.github.io/signal
