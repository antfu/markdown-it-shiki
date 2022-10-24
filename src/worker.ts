import type { Highlighter, ILanguageRegistration, IThemeRegistration } from 'shiki'
import { getHighlighter } from 'shiki'
import { runAsWorker } from 'synckit'

let h: Highlighter

function handler(command: 'getHighlighter', options: {
  themes: IThemeRegistration[]
  langs: ILanguageRegistration[]
}): void
function handler(command: 'codeToHtml', options: {
  code: string
  lang: string
  theme: string | undefined
}): Promise<string>
async function handler(command: 'getHighlighter' | 'codeToHtml', options: any) {
  if (command === 'getHighlighter') {
    h = await getHighlighter(options)
  }
  else if (command === 'codeToHtml') {
    const { code, lang, theme } = options
    const loadedLanguages = h.getLoadedLanguages()
    if (loadedLanguages.includes(lang))
      return h.codeToHtml(code, { lang })
    else
      return h.codeToHtml(code, { lang: 'text', theme })
  }
}

runAsWorker(handler)
