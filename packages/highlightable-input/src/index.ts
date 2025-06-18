import {
  supportsPlainText,
  isFirefox,
  getValueFromElement,
  getHTMLToRender,
  registerCustomElement,
  isChrome,
  isSelectAllShortcut,
  isUndoShortcut,
  isRedoShortcut,
  restoreResizing
} from './browser'
import { setFocusable, setContentEditable, setRows } from './utils'
import {
  getSelection,
  setSelection,
  type SelectOffsets,
  type SelectOptions
} from './cursor'
import { type HistoryEntry, createHistory } from './history'

type Replacer = Parameters<typeof String.prototype.replace>[1]

export interface HighlightRule {
  pattern: RegExp | string
  class?: string
  tagName?: string
  style?: string
  replacer?: Replacer
}

export interface SetupOptions {
  defaultValue?: string
  highlight: HighlightRule | Array<HighlightRule> | ((value: string) => string)
  patch?: (el: HTMLElement, html: string) => void
  onInput?: (event: { value: string; position: number }) => void
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
  { defaultValue, onInput, highlight, patch }: SetupOptions
) {
  const fixPaste = !supportsPlainText()

  let text = ''
  let html = ''
  let selection: readonly [number, number] = [0, 0]

  let multiLine = false
  let disabled = false
  let readOnly = false
  let rows = 2

  let composing = false
  let selectionChanged = false

  init(defaultValue)

  const history = createHistory({
    value: defaultValue ?? getValueFromElement(el, multiLine),
    offsets: [0, 0],
    source: 'initial'
  })

  return {
    getValue() {
      return text
    },
    setValue(value: string): boolean {
      if (value === text) {
        return false
      }

      updateHTML(false, value)
      return true
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

  function init(defaultValue?: string) {
    multiLine = el.getAttribute('aria-multiline') === 'true'
    disabled = el.getAttribute('aria-disabled') === 'true'
    readOnly = el.getAttribute('aria-readonly') === 'true'

    const rowsValue = Number.parseInt(el.getAttribute('data-rows') ?? '', 10)
    rows = rowsValue > 0 ? rowsValue : rows

    text = html = ''

    updateHTML(false, defaultValue)

    // only editable on focus or hover
    setContentEditable(el, false)

    setFocusable(el, !disabled)

    setRows(el, rows)

    el.setAttribute('role', 'textbox')

    if (instances === 0) {
      window.addEventListener('mousedown', globalMousedown)
      window.addEventListener('keydown', globalKeydown)
    }

    if (fixPaste) {
      el.addEventListener('paste', handlePaste)
    }

    el.addEventListener('keydown', handleKeydown)
    el.addEventListener('beforeinput', handleBeforeInput)
    el.addEventListener('compositionstart', handleCompositionStart)
    el.addEventListener('compositionend', handleCompositionEnd)
    el.addEventListener('input', handleInput)
    el.addEventListener('focus', handleFocus)
    el.addEventListener('blur', handleBlur)
    el.addEventListener('dblclick', restoreResizing)

    instances++
  }

  function dispose() {
    instances--

    text = html = ''

    if (instances === 0) {
      window.removeEventListener('mousedown', globalMousedown)
      window.removeEventListener('keydown', globalKeydown)
    }

    if (fixPaste) {
      el.removeEventListener('paste', handlePaste)
    }

    el.removeEventListener('keydown', handleKeydown)
    el.removeEventListener('beforeinput', handleBeforeInput)
    el.removeEventListener('compositionstart', handleCompositionStart)
    el.removeEventListener('compositionend', handleCompositionEnd)
    el.removeEventListener('input', handleInput)
    el.removeEventListener('focus', handleFocus)
    el.removeEventListener('blur', handleBlur)
    el.removeEventListener('dblclick', restoreResizing)
  }

  function updateHTML(
    fromUser: boolean,
    value: string = getValueFromElement(el, multiLine)
  ) {
    text = value
    html = performHighlight(text)

    const isActive = el === document.activeElement

    const offsets: readonly [number, number] = isActive
      ? getSelection(el)
      : [0, 0]

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
   * Input handlers
   */
  function handleBeforeInput(e: InputEvent) {
    if (
      !multiLine &&
      (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak')
    ) {
      e.preventDefault()
      return
    }

    historyBeforeInput(e)
  }

  function handleCompositionStart() {
    historyBeforeInput()
    composing = true
  }

  function handleCompositionEnd() {
    composing = false

    if (!isFirefox()) {
      updateHTML(true)
      historyInput()
    }
  }

  function handleInput(e: Event) {
    const ev = e as InputEvent

    // Skips composition
    if (composing) {
      return
    }

    updateHTML(true)
    historyInput(ev)
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
    if (readOnly && isSelectAllShortcut(e)) {
      setSelection(el, true)
      e.preventDefault()
    } else if (isUndoShortcut(e)) {
      history.undo(historySync)
      e.preventDefault()
    } else if (isRedoShortcut(e)) {
      history.redo(historySync)
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
        result = result.replace(rule.pattern, (...args) => {
          const markup = replacer(...args)
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

  function historySync(entry: HistoryEntry) {
    updateHTML(false, entry.value)
    setSelection(el, entry.offsets)

    if (onInput) {
      onInput({ value: text, position: entry.offsets[0]})
    }
  }

  function historyBeforeInput(e?: InputEvent) {
    let { undo, update } = history

    if (composing) {
      return
    }

    if (e?.inputType === 'historyUndo') {
      undo(historySync)
      e.preventDefault()
    } else if (e?.inputType === 'historyRedo') {
      history.redo(historySync)
      e.preventDefault()
    } else {
      const [start, end] = getSelection(el)
      const [currentStart, currentEnd] = history.current.offsets
      if (start !== end || start !== currentStart || end !== currentEnd) {
        // selection changed
        selectionChanged = true
      }

      update({
        offsets: [start, end]
      })
    }
  }

  function historyInput(e?: InputEvent) {
    let { current, update, insert } = history
    let source: HistoryEntry['source'] | null = null

    // Handle history
    if (!e || e.inputType === 'insertText') {
      if (e?.data === ' ') {
        if (current.source !== 'space') {
          source = 'space'
        }
      } else {
        if (current.source !== 'normal' || selectionChanged) {
          source = 'normal'
        }
      }

      if (!source) {
        update({
          value: text,
          offsets: getSelection(el)
        })
      }
    } else if (e.inputType.indexOf('insert') === 0) {
      source = 'single'
    } else if (
      e.inputType.indexOf('delete') === 0 &&
      current.source !== 'delete'
    ) {
      source = 'delete'
    }

    const offsets = getSelection(el)
    if (source) {
      insert({
        value: text,
        offsets,
        source
      })
    } else {
      update({
        value: text,
        offsets
      })
    }

    selectionChanged = false
  }
}
