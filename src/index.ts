import { getHighlighter, Highlighter, IThemeRegistration, Theme } from '@antfu/shiki'
import type MarkdownIt from 'markdown-it'
import deasync from 'deasync'

export interface DarkModeThemes {
  dark: Theme
  light: Theme
}

export interface Options {
  theme?: Theme | DarkModeThemes
}

const MarkdownItShiki: MarkdownIt.PluginWithOptions<Options> = (markdownit, options = {}) => {
  let _highlighter: Highlighter = undefined!

  const themes: IThemeRegistration[] = []
  let darkModeThemes: DarkModeThemes | undefined

  if (!options.theme) {
    themes.push('nord')
  }
  else if (typeof options.theme === 'string') {
    themes.push(options.theme)
  }
  else {
    darkModeThemes = options.theme
    themes.push(options.theme.dark)
    themes.push(options.theme.light)
  }

  getHighlighter({ themes })
    .then((h) => {
      _highlighter = h
    })

  markdownit.options.highlight = (code, lang) => {
    // eslint-disable-next-line no-unmodified-loop-condition
    while (!_highlighter)
      deasync.sleep(100)

    if (darkModeThemes) {
      const dark = _highlighter.codeToHtml(code, lang || 'text', darkModeThemes.dark)
      const light = _highlighter.codeToHtml(code, lang || 'text', darkModeThemes.light)
      return dark.replace('<div class="shiki"', '<div class="shiki shiki-dark"') + light.replace('<div class="shiki"', '<div class="shiki shiki-light"')
    }
    else {
      return _highlighter.codeToHtml(code, lang || 'text')
    }
  }
}

export default MarkdownItShiki
