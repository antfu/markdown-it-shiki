import { createRequire } from 'module'
import type { Highlighter, ILanguageRegistration, IShikiTheme, IThemeRegistration } from 'shiki'
import type MarkdownIt from 'markdown-it'
import { createSyncFn } from 'synckit'

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
  const _highlighter = options.highlighter

  const {
    langs,
    themes,
    darkModeThemes,
  } = resolveOptions(options)

  let syncRun: any
  if (!_highlighter) {
    const require = createRequire(import.meta.url)
    syncRun = createSyncFn(require.resolve('./worker'))
    syncRun('getHighlighter', { langs, themes })
  }

  const highlightCode = (code: string, lang: string, theme?: string): string => {
    if (_highlighter)
      return _highlighter.codeToHtml(code, lang || 'text', theme)

    return syncRun('codeToHtml', {
      code,
      theme,
      lang: lang || 'text',
    })
  }

  markdownit.options.highlight = (code, lang) => {
    if (darkModeThemes) {
      const dark = highlightCode(code, lang, darkModeThemes.dark)
        .replace('<pre class="shiki"', '<pre class="shiki shiki-dark"')
      const light = highlightCode(code, lang || 'text', darkModeThemes.light)
        .replace('<pre class="shiki"', '<pre class="shiki shiki-light"')
      return `<div class="shiki-container">${dark}${light}</div>`
    }
    else {
      return highlightCode(code, lang || 'text')
    }
  }
}

export default MarkdownItShiki
