import { getHighlighter, Highlighter, ILanguageRegistration, IThemeRegistration, Theme } from 'shiki'
import type MarkdownIt from 'markdown-it'
import deasync from 'deasync'
import Debug from 'debug'

const debug = Debug('markdown-it-shiki')

export interface DarkModeThemes {
  dark: Theme
  light: Theme
}

export interface Options {
  theme?: Theme | DarkModeThemes
  langs?: ILanguageRegistration[]
  timeout?: number
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

  const {
    timeout = 10_000,
    langs,
  } = options

  getHighlighter({ themes, langs })
    .then((h) => {
      _highlighter = h
    })

  markdownit.options.highlight = (code, lang) => {
    if (!_highlighter) {
      debug('awaiting getHighlighter()')
      let count = timeout / 200
      // eslint-disable-next-line no-unmodified-loop-condition
      while (!_highlighter) {
        deasync.sleep(200)
        count -= 1
        if (count <= 0)
          throw new Error('Shiki.getHighlighter() never gets resolved')
      }
      debug('getHighlighter() resolved')
    }

    if (darkModeThemes) {
      const dark = _highlighter.codeToHtml(code, lang || 'text', darkModeThemes.dark)
      const light = _highlighter.codeToHtml(code, lang || 'text', darkModeThemes.light)
      return dark.replace('<pre class="shiki"', '<pre class="shiki shiki-dark"') + light.replace('<pre class="shiki"', '<pre class="shiki shiki-light"')
    }
    else {
      return _highlighter.codeToHtml(code, lang || 'text')
    }
  }
}

export default MarkdownItShiki
