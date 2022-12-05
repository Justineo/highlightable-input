let registered: boolean | null = null

export function registerCustomElement(): boolean {
  if (registered != null) {
    return registered
  }

  if (
    typeof HTMLElement === 'undefined' ||
    typeof customElements === 'undefined'
  ) {
    return (registered = false)
  }

  class HighlightableInput extends HTMLElement {
    static formAssociated = true
  }

  if (customElements.get('highlightable-input') == null) {
    customElements.define('highlightable-input', HighlightableInput)
  }

  return (registered = true)
}

let isPlainTextSupported: boolean | null = null

export function supportsPlainText() {
  if (isPlainTextSupported == null) {
    isPlainTextSupported = CSS.supports(
      '-webkit-user-modify',
      'read-write-plaintext-only'
    )
  }

  return isPlainTextSupported
}

let isFF: boolean | null = null

export function isFirefox() {
  if (isFF == null) {
    isFF = navigator.userAgent.indexOf('Firefox') !== -1
  }

  return isFF
}

let isCr: boolean | null = null

// includes Chromium based browsers like Edge
export function isChrome() {
  if (isCr == null) {
    isCr = navigator.userAgent.indexOf('Chrome') !== -1
  }

  return isCr
}

let isMacOS: boolean | null = null

export function isMac() {
  if (isMacOS == null) {
    isMacOS = navigator.platform.indexOf('Mac') !== -1
  }

  return isMacOS
}

// Get the user-expected text content of the element instead of the
// text content actually rendered by the browser. For single-line
// inputs, line breaks are replaced with spaces. For multi-line
// inputs, the last line break is removed.
export function getValueFromElement(el: HTMLElement, multiLine: boolean) {
  // Use `innerText` instead of `textContent` to get the correct
  // text value. In Firefox, `textContent` is not sufficient to get
  // the correct line breaks while editing.
  const text = el.innerText || ''
  return multiLine ? text.replace(/\n$/, '') : text.replace(/\r?\n/g, ' ')
}

// The highlighted HTML need to be processed for it to be
// correctly rendered in the DOM.
export function getHTMLToRender(html: string, multiLine: boolean) {
  return !multiLine || html === '' ? html : html + '\n'
}
