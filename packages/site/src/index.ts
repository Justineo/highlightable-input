import { setup } from 'highlightable-input'
import { tweet, color, variable } from './rules'
import mountVueApp from './vue'
import mountReactApp from './react'
import 'highlightable-input/style.css'
import 'highlightable-input/themes/antd.css'
import 'highlightable-input/themes/arco.css'
import 'highlightable-input/themes/atlassian.css'
import 'highlightable-input/themes/bootstrap.css'
import 'highlightable-input/themes/carbon.css'
import 'highlightable-input/themes/chakra.css'
import 'highlightable-input/themes/fluent.css'
import 'highlightable-input/themes/kongponents.css'
import 'highlightable-input/themes/light.css'
import 'highlightable-input/themes/lightning.css'
import 'highlightable-input/themes/semi.css'
import 'highlightable-input/themes/spectrum.css'

declare global {
  interface Window {
    primaryColors: Record<string, string>
  }
}

const els = document.querySelectorAll<HTMLElement>('highlightable-input')
const styler = document.querySelector<HTMLElement>('#styler')!
const customStyle = document.querySelector<HTMLStyleElement>('#custom-style')!
const prompt = document.querySelector<HTMLElement>('#prompt')!

function updateStyle(value: string) {
  customStyle.textContent = value
}

updateStyle(styler.textContent!)

els.forEach((el) => {
  setup(el, {
    highlight: el === styler ? color : el === prompt ? variable : tweet,
    onInput: ({ value }) => {
      console.log(value.replace(/\n/g, '↵'))

      if (el === styler) {
        updateStyle(value)
      }
    }
  })
})

const themeMeta = document.querySelector<HTMLMetaElement>(
  'meta[name="theme-color"]'
)!
const themeSelect = document.querySelector<HTMLSelectElement>('#theme select')!
themeSelect.addEventListener('change', () => {
  updateTheme(themeSelect.value)
})

const themeUpdateCallbacks: Array<(theme: string) => void> = []

function updateTheme(theme: string) {
  const color = window.primaryColors[theme] || window.primaryColors.none
  document.documentElement.style.setProperty('--theme-color', color)
  themeMeta.content = color

  els.forEach((el) => {
    el.dataset.theme = theme
  })

  themeUpdateCallbacks.forEach((callback) => {
    callback(theme)
  })
}

styler.addEventListener('keydown', (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Tab':
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
      break
    case 'Esc':
    case 'Escape':
      styler.blur()
      break
  }
})

const themeCount = themeSelect.querySelectorAll('option').length

function toggleThemeSelect(collapse: boolean) {
  themeSelect.size = collapse ? 0 : themeCount
}

let mql = window.matchMedia('(max-width: 600px)')
mql.addEventListener('change', (e) => {
  toggleThemeSelect(e.matches)
})
toggleThemeSelect(mql.matches)

declare global {
  interface Window {
    registerVueApp: (updater: (theme: string) => void) => void
    registerReactApp: (updater: (theme: string) => void) => void
  }
}

const loadingVueApp = new Promise<void>((resolve) => {
  window.registerVueApp = (updateTheme) => {
    themeUpdateCallbacks.push(updateTheme)
    resolve()
  }
})

const loadingReactApp = new Promise<void>((resolve) => {
  window.registerReactApp = (updateTheme) => {
    themeUpdateCallbacks.push(updateTheme)
    resolve()
  }
})

Promise.all([loadingVueApp, loadingReactApp]).then(() => {
  updateTheme(themeSelect.value)
})

mountVueApp()
mountReactApp()
