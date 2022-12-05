import {
  supportsPlainText,
  isFirefox,
  getValueFromElement,
  getHTMLToRender,
  registerCustomElement,
  isMac,
  isChrome
} from './browser'
import { setFocusable, setContentEditable } from './utils'
import {
  getSelection,
  setSelection,
  type SelectOffsets,
  type SelectOptions
} from './cursor'

type Replacer = Parameters<typeof String.prototype.replace>[1]

export interface HighlightRule {
  pattern: RegExp | string
  class?: string
  tagName?: string
  style?: string
  replacer?: Replacer
}

export interface SetupOptions {
  highlight: HighlightRule | Array<HighlightRule> | ((value: string) => string)
  patch?: (el: HTMLElement, html: string) => void
  onInput?: ({ value }: { value: string; position: number }) => void
}

export type HighlightableInput = ReturnType<typeof setup>

registerCustomElement()

let lastModality: 'keyboard' | 'pointer' | null = null
let lastKey: string | null = null
let lastClicked: HTMLElement | null = null

function globalMousedown(e: MouseEvent) {
  lastModality = 'pointer'
  lastKey = null
  lastClicked = e.target as HTMLElement
}

function globalKeydown(e: KeyboardEvent) {
  lastModality = 'keyboard'
  lastKey = e.key
  lastClicked = null
}

let instances = 0

export function setup(
  el: HTMLElement,
  { onInput, highlight, patch }: SetupOptions
) {
  const fixPaste = !supportsPlainText()

  let text: string | null = null
  let html: string | null = null
  let selection: [number, number] | null = null

  let multiLine: boolean = false
  let disabled: boolean = false
  let readOnly: boolean = false

  init()

  return {
    getValue() {
      return text
    },
    setValue(value: string) {
      if (value === text) {
        return
      }

      updateHTML(false, value)
    },
    setSelection(offsets: SelectOffsets, options?: SelectOptions) {
      setSelection(el, offsets, options)
    },
    getSelection() {
      return getSelection(el)
    },
    valueToRawHTML(value: string) {
      return performHighlight(value)
    },
    dispose,
    refresh() {
      dispose()
      init()
    }
  }

  function init() {
    multiLine = el.getAttribute('aria-multiline') === 'true'
    disabled = el.getAttribute('aria-disabled') === 'true'
    readOnly = el.getAttribute('aria-readonly') === 'true'

    text = html = null

    updateHTML(false)

    // only editable on focus or hover
    setContentEditable(el, false)

    setFocusable(el, !disabled)

    el.setAttribute('role', 'textbox')

    if (instances === 0) {
      window.addEventListener('mousedown', globalMousedown)
      window.addEventListener('keydown', globalKeydown)
    }

    if (!multiLine) {
      el.addEventListener('beforeinput', handleBeforeInput)
    }

    if (!isFirefox()) {
      el.addEventListener('compositionend', handleCompositionEnd)
    }

    if (fixPaste) {
      el.addEventListener('paste', handlePaste)
    }

    if (readOnly) {
      el.addEventListener('keydown', handleKeydown)
    }

    el.addEventListener('input', handleInput)
    el.addEventListener('focus', handleFocus)
    el.addEventListener('blur', handleBlur)

    instances++
  }

  function dispose() {
    instances--

    text = html = null

    if (instances === 0) {
      window.removeEventListener('mousedown', globalMousedown)
      window.removeEventListener('keydown', globalKeydown)
    }

    if (!multiLine) {
      el.removeEventListener('beforeinput', handleBeforeInput)
    }

    if (!isFirefox()) {
      el.removeEventListener('compositionend', handleCompositionEnd)
    }

    if (fixPaste) {
      el.removeEventListener('paste', handlePaste)
    }

    if (readOnly) {
      el.removeEventListener('keydown', handleKeydown)
    }

    el.removeEventListener('input', handleInput)
    el.removeEventListener('focus', handleFocus)
    el.removeEventListener('blur', handleBlur)
  }

  function updateHTML(
    fromUser: boolean,
    value: string = getValueFromElement(el, multiLine)
  ) {
    text = value
    html = performHighlight(text)

    const isActive = el === document.activeElement

    const offsets: [number, number] = isActive ? getSelection(el) : [0, 0]

    if (patch) {
      patch(el, html)
    } else {
      el.innerHTML = html
    }

    setSelection(el, offsets)

    if (fromUser && onInput) {
      onInput({ value: text, position: offsets[1] })
    }
  }

  /**
   * Event handlers
   */
  function handleBeforeInput(e: InputEvent) {
    if (
      e.inputType === 'insertParagraph' ||
      e.inputType === 'insertLineBreak'
    ) {
      e.preventDefault()
    }
  }

  function handleCompositionEnd() {
    updateHTML(true)
  }

  function handleInput(e: Event) {
    // Skips composition
    if ((e as InputEvent).isComposing) {
      return
    }

    updateHTML(true)
  }

  function handlePaste(e: ClipboardEvent) {
    if (!e.clipboardData) {
      return
    }

    const text = e.clipboardData.getData('text')
    document.execCommand('insertText', false, text)
    e.preventDefault()

    if (onInput) {
      onInput({ value: text, position: getSelection(el)[1] })
    }
  }

  function handleFocus() {
    if (!readOnly) {
      setContentEditable(el, true)
    }

    if (lastModality === 'keyboard' && lastKey === 'Tab' && !multiLine) {
      setSelection(el, true)
    } else if (lastModality === 'keyboard' || !el.contains(lastClicked)) {
      // Restore selection when users focus back into the input in certain cases
      // 1. programmatic focus
      // 2. or clicking from the labels outside the input
      setSelection(el, selection || [0, 0])
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key.toLowerCase() !== 'a' || e.shiftKey || e.altKey) {
      return
    }

    if (
      (isMac() && e.metaKey && !e.ctrlKey) ||
      (!isMac() && e.ctrlKey && !e.metaKey)
    ) {
      setSelection(el, true)
      e.preventDefault()
    }
  }

  function handleBlur() {
    if (isChrome()) {
      // save selection on blur
      selection = getSelection(el)
    }
    setContentEditable(el, false)
    el.scrollLeft = 0
  }

  function getDefaultReplacer(rule: HighlightRule): Replacer {
    return (match) =>
      `<${rule.tagName || 'mark'}${rule.class ? ` class="${rule.class}"` : ''}${
        rule.style ? ` style="${rule.style}"` : ''
      }>${match}</${rule.tagName || 'mark'}>`
  }

  function performHighlight(text: string) {
    let result = text

    if (typeof highlight === 'function') {
      result = highlight(result)
    } else {
      // Safely replace multiple patterns with Unicode PUA characters first to
      // avoid replacing the generated markup content. After all patterns are
      // replaced, we can safely replace back.
      const m2k = new Map<string, string>()
      const k2m = new Map<string, string>()

      for (const rule of Array.isArray(highlight) ? highlight : [highlight]) {
        const replacer = rule.replacer || getDefaultReplacer(rule)
        result = result.replace(rule.pattern, (match) => {
          const markup = replacer(match)
          let key = m2k.get(markup)

          if (!key) {
            // Use Unicode PUA
            key = String.fromCodePoint(0xf0000 + m2k.size)
            m2k.set(markup, key)
            k2m.set(key, markup)
          }

          return key
        })
      }

      if (k2m.size !== 0) {
        const pattern = new RegExp([...k2m.keys()].join('|'), 'g')
        result = result.replace(pattern, (match) => k2m.get(match)!)
      }
    }

    return getHTMLToRender(result, multiLine)
  }
}
