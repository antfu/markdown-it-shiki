# markdown-it-shiki

[Markdown It](https://markdown-it.github.io/) plugin for [Shiki](https://github.com/shikijs/shiki)

> Note currently this plugin uses my fork [@antfu/shiki](https://github.com/antfu/shiki/tree/feat/isomorphic), a WIP implementation of [this RFC](https://github.com/shikijs/shiki/issues/91). Will switch back to the official version once the implementation gets merged and shipped.

## Install 

```bash
npm i -D markdown-it-shiki
```

## Usage

```ts
import MarkdownIt from 'markdown-it'
import Shiki from 'markdown-it-shiki'

const md = MarkdownIt()

md.use(Shiki, {
  theme: 'nord'
})
```

### Dark mode

```js
md.use(Shiki, {
  theme: {
    dark: 'min-dark',
    light: 'min-light'
  }
})
```

Add then these to your CSS


```css
/* Query based dark mode */

@media (prefers-color-scheme: dark) {
  .shiki-light {
    display: none;
  }
}

@media (prefers-color-scheme: light), (prefers-color-scheme: no-preference) {
  .shiki-dark {
    display: none;
  }
}

```

```css
/* Class based dark mode */

html.dark .shiki-light {
  display: none;
}

html:not(.dark) .shiki-dark {
  display: none;
}
```

