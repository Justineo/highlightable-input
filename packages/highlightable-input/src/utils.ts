export function setContentEditable(el: HTMLElement, value: boolean) {
  if (value) {
    el.contentEditable = 'true'
  } else {
    // el.contentEditable = "false" doesn't seem to work in Safari
    el.removeAttribute('contenteditable')
  }
}

export function setFocusable(el: HTMLElement, value: boolean) {
  if (value) {
    el.tabIndex = 0
  } else {
    el.removeAttribute('tabindex')
  }
}

export function setRows(el: HTMLElement, value: number) {
  el.style.setProperty('--rows', value.toString())
}

const ESCAPE_LOOKUP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const ESCAPE_PATTERN = /[&<>"']/g

export function escapeHTML(text: string): string {
  ESCAPE_PATTERN.lastIndex = 0
  return ESCAPE_PATTERN.test(text)
    ? text.replace(ESCAPE_PATTERN, (char) => ESCAPE_LOOKUP[char])
    : text
}
