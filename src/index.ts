import { getHighlighter, Highlighter, ILanguageRegistration, IShikiTheme, IThemeRegistration } from 'shiki'
import type MarkdownIt from 'markdown-it'
import deasync from 'deasync'
import Debug from 'debug'

const debug = Debug('markdown-it-shiki')

export interface DarkModeThemes {
  dark: IThemeRegistration
  light: IThemeRegistration
}

export interface Options {
  theme?: IThemeRegistration | DarkModeThemes
  langs?: ILanguageRegistration[]
  timeout?: number
  highlighter?: Highlighter
}

function getThemeName(theme: IThemeRegistration) {
  if (typeof theme === 'string')
    return theme
  return (theme as IShikiTheme).name
}

export function resolveOptions(options: Options) {
  const themes: IThemeRegistration[] = []
  let darkModeThemes: DarkModeThemes | undefined

  if (!options.theme) {
    themes.push('nord')
  }
  else if (typeof options.theme === 'string') {
    themes.push(options.theme)
  }
  else {
    if ('dark' in options.theme || 'light' in options.theme) {
      darkModeThemes = options.theme
      themes.push(options.theme.dark)
      themes.push(options.theme.light)
    }
    else {
      themes.push(options.theme)
    }
  }

  return {
    ...options,
    themes,
    darkModeThemes: darkModeThemes
      ? {
        dark: getThemeName(darkModeThemes.dark),
        light: getThemeName(darkModeThemes.light),
      }
      : undefined,
  }
}

const MarkdownItShiki: MarkdownIt.PluginWithOptions<Options> = (markdownit, options = {}) => {
  let _highlighter: Highlighter = options.highlighter!

  const {
    timeout = 10_000,
    langs,
    themes,
    darkModeThemes,
  } = resolveOptions(options)

  if (!_highlighter) {
    getHighlighter({ themes, langs })
      .then((h) => {
        _highlighter = h
      })
  }

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
      const dark = _highlighter
        .codeToHtml(code, lang || 'text', darkModeThemes.dark)
        .replace('<pre class="shiki"', '<pre class="shiki shiki-dark"')
      const light = _highlighter
        .codeToHtml(code, lang || 'text', darkModeThemes.light)
        .replace('<pre class="shiki"', '<pre class="shiki shiki-light"')
      return `<div class="shiki-container">${dark}${light}</div>`
    }
    else {
      return _highlighter.codeToHtml(code, lang || 'text')
    }
  }
}

export default MarkdownItShiki
