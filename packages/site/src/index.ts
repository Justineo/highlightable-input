import { innerHTML } from 'diffhtml'
import { setup } from 'highlightable-input'
import { rules } from './highlight'
import mountVueApp from './vue'
import mountReactApp from './react'
import 'highlightable-input/style.css'
import 'highlightable-input/themes/light.css'
import 'highlightable-input/themes/antd.css'
import 'highlightable-input/themes/arco.css'
import 'highlightable-input/themes/atlassian.css'
import 'highlightable-input/themes/bootstrap.css'
import 'highlightable-input/themes/carbon.css'
import 'highlightable-input/themes/chakra.css'
import 'highlightable-input/themes/fluent.css'
import 'highlightable-input/themes/lightning.css'
import 'highlightable-input/themes/semi.css'
import 'highlightable-input/themes/spectrum.css'

const els = document.querySelectorAll<HTMLElement>('highlightable-input')
const styler = document.querySelector<HTMLInputElement>('#styler')!
const customStyle = document.querySelector<HTMLStyleElement>('#custom-style')!

function updateStyle(value: string) {
  customStyle.textContent = value
}

updateStyle(styler.textContent!)

els.forEach((el) => {
  setup(el, {
    highlight:
      el === styler
        ? [
            {
              pattern:
                /\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rebeccapurple|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)\b/gi,
              replacer: (match: string) =>
                `<mark style="background: none; border-bottom: 2px solid ${match}">${match}</mark>`
            },
            {
              pattern: /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})/gi,
              replacer: (match: string) =>
                `<mark style="background: none; border-bottom: 2px solid ${match}">${match}</mark>`
            }
          ]
        : rules,
    // patch: (el, html) => {
    //   innerHTML(el, html)
    // },
    onInput: ({ value }) => {
      console.log(value.replace(/\n/g, '↵'))

      if (el === styler) {
        updateStyle(value)
      }
    }
  })
})

const primaryColors: Record<string, string> = {
  none: '#000',
  light: '#0052cc',
  antd: '#1677ff',
  arco: '#165dff',
  atlassian: '#0052cc',
  bootstrap: '#0d6efd',
  carbon: '#0f62fe',
  chakra: '#309795',
  fluent: '#0178d4',
  lightning: '#0176d3',
  semi: '#0064fa',
  spectrum: '#0868e3'
}

const themeMeta = document.querySelector<HTMLMetaElement>(
  'meta[name="theme-color"]'
)!
const themeSelect = document.querySelector<HTMLSelectElement>('#theme select')!
themeSelect.addEventListener('change', () => {
  updateTheme(themeSelect.value)
})

const themeUpdateCallbacks: Array<(theme: string) => void> = []

function updateTheme(theme: string) {
  const color = primaryColors[theme] || primaryColors.none
  document.documentElement.style.setProperty('--theme-color', color)
  themeMeta.content = color

  els.forEach((el) => {
    el.dataset.theme = theme
  })

  themeUpdateCallbacks.forEach(callback => { callback(theme) })
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

let mql = window.matchMedia('(max-width: 600px)');
mql.addEventListener('change', (e) => {
  toggleThemeSelect(e.matches)
})
toggleThemeSelect(mql.matches)

declare global {
  interface Window {
    registerVueApp: (updater: (theme: string) => void) => void;
    registerReactApp: (updater: (theme: string) => void) => void;
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
