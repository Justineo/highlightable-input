export interface SelectOptions {
  force?: boolean
  collapse?: 'start' | 'end' | false
}

export type SelectOffsets = [number, number] | number | true

export function getSelection(el: HTMLElement): [number, number] {
  const { anchorNode, anchorOffset, focusNode, focusOffset } =
    window.getSelection()!

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let start = 0
  let end = 0
  let current: Node | null = null
  let startOffset: number | null = null
  let endOffset: number | null = null

  while ((current = walker.nextNode())) {
    if (startOffset == null) {
      if (current === anchorNode) {
        start += anchorOffset
        startOffset = start
      } else {
        start += current.nodeValue!.length
      }
    }

    if (endOffset == null) {
      if (current === focusNode) {
        end += focusOffset
        endOffset = end
      } else {
        end += current.nodeValue!.length
      }
    }

    if (startOffset != null && endOffset != null) {
      return [startOffset, endOffset]
    }
  }

  return [0, 0]
}

export function setSelection(
  el: HTMLElement,
  offsets: SelectOffsets,
  { force = false, collapse = false }: SelectOptions = {}
) {
  if (document.activeElement !== el && !force) {
    return
  }

  if (offsets === true) {
    // select all
    selectAll(el)
  } else {
    selectByOffsets(el, Array.isArray(offsets) ? offsets : [offsets, offsets])
  }

  if (!collapse) {
    return
  }

  const selection = window.getSelection()!
  if (collapse === 'start') {
    selection.collapseToStart()
  } else if (collapse === 'end') {
    selection.collapseToEnd()
  }
}

function selectByOffsets(el: HTMLElement, offsets: [number, number]) {
  const selection = window.getSelection()!
  const [startOffset, endOffset] = offsets
  const collapsed = startOffset === endOffset
  let [remainingStart, remainingEnd] =
    startOffset > endOffset
      ? [endOffset, startOffset]
      : [startOffset, endOffset]
  let current: Node | null = null
  let startNode: Node | null = null
  let endNode: Node | null = null

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)

  while ((current = walker.nextNode())) {
    if (startNode == null) {
      if (remainingStart > current.nodeValue!.length) {
        remainingStart -= current.nodeValue!.length
      } else {
        startNode = current
      }
    }

    if (endNode == null && !collapsed) {
      if (remainingEnd > current.nodeValue!.length) {
        remainingEnd -= current.nodeValue!.length
      } else {
        endNode = current
      }
    }

    if (startNode && (endNode || collapsed)) {
      const range = document.createRange()
      range.setStart(startNode, remainingStart)

      if (endNode) {
        range.setEnd(endNode, remainingEnd)
      }

      selection.removeAllRanges()
      selection.addRange(range)

      return
    }
  }
}

function selectAll(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)

  let current: Node | null = null
  let first: Node | null = null
  let last: Node | null = null

  while ((current = walker.nextNode())) {
    if (!first) {
      first = current
    }
    last = current
  }

  const selection = window.getSelection()!
  const range = document.createRange()

  if (!first || !last) {
    range.selectNodeContents(el)
    return
  }

  range.setStart(first, 0)
  range.setEnd(last, last.nodeValue!.length)

  selection.removeAllRanges()
  selection.addRange(range)
}
