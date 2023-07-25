export type HistoryEntry = Readonly<{
  value: string
  offsets: readonly [number, number]
  source: 'initial' | 'space' | 'normal' | 'single' | 'delete'
}>

type History = Readonly<{
  insert(entry: HistoryEntry): void
  update(entry: Partial<HistoryEntry>): void
  undo(callback: (entry: HistoryEntry) => void): void
  redo(callback: (entry: HistoryEntry) => void): void
  readonly current: HistoryEntry
}>

export function createHistory(initial: HistoryEntry): History {
  const stack: HistoryEntry[] = [initial]
  let currentIndex: number = 0

  return {
    insert(entry) {
      stack.splice(currentIndex + 1, stack.length, entry)
      currentIndex = stack.length - 1
    },
    update(entry) {
      Object.assign(stack[currentIndex], entry)
    },
    undo(callback) {
      if (currentIndex !== 0) {
        callback(stack[--currentIndex])
      }
    },
    redo(callback) {
      if (currentIndex !== stack.length - 1) {
        callback(stack[++currentIndex])
      }
    },
    get current() {
      return stack[currentIndex]
    }
  }
}
