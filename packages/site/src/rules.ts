const supportLookbehind = (() => {
  try {
    new RegExp('(?<=a)b')
    return true
  } catch {
    return false
  }
})()

export const tweet = [
  {
    pattern: supportLookbehind
      ? new RegExp('(?<=^|\\s)@[a-z][\\da-z_]+', 'gi')
      : /@[a-z][\\da-z_]+/gi,
    class: 'link'
  },
  {
    pattern: supportLookbehind
      ? new RegExp('(?<=^|\\s)#[a-z][\\da-z_]+', 'gi')
      : /#[a-z][\\da-z_]+/gi,
    class: 'link'
  }
]

export const variable = [
  {
    pattern: /\{\{([a-z_]+?)\}\}/gi,
    replacer: (_: string, name: string) => {
      console.log(_, name)
      return `<mark class="variable"><span>{{</span>${name}<span>}}</span></mark>`
    }
  }
]

export const color = [
  {
    pattern:
      /currentColor|(?:rgba?|hsla?|hwb|lab|lch|oklch|color)\([^)]+\)|#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})|(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rebeccapurple|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)/gi,
    replacer: (match: string) =>
      `<mark style="background: none; border-bottom: 2px solid ${match}">${match}</mark>`
  }
]
