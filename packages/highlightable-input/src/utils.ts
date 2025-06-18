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
