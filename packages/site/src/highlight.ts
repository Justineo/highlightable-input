const supportLookbehind = (() => {
  try {
    new RegExp('(?<=a)b')
    return true
  } catch {
    return false
  }
})()

export const rules = [
  {
    pattern: supportLookbehind
      ? new RegExp('(?<=^|\\s)@[a-z][\\da-z_]+', 'gi')
      : /@[a-z][\\da-z_]+/gi,
    class: 'mention'
  },
  {
    pattern: supportLookbehind
      ? new RegExp('(?<=^|\\s)#[a-z][\\da-z_]+', 'gi')
      : /#[a-z][\\da-z_]+/gi,
    class: 'hashtag'
  }
]
