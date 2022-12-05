import { useRef, useEffect, useLayoutEffect, HTMLAttributes } from 'react'
import { setup, type HighlightableInput, type SetupOptions } from './index'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'highlightable-input': any
    }
  }
}
type HighlightableInputProps = {
  value?: string
  multiline?: boolean
  readonly?: boolean
  disabled?: boolean
  theme?: string
  highlight: SetupOptions['highlight']
  patch?: SetupOptions['patch']
  onChange?: (text: string) => void
} & Omit<HTMLAttributes<HTMLElement>, 'onChange'>

const Component = (props: HighlightableInputProps) => {
  const {
    value,
    multiline,
    readonly,
    disabled,
    theme,
    highlight,
    patch,
    onChange,
    ...restProps
  } = props

  const root = useRef<HTMLElement>(null)
  const input = useRef<HighlightableInput | null>(null)

  // const controlled = value !== undefined

  useLayoutEffect(() => {
    if (!root.current) {
      return
    }

    input.current = setup(root.current, {
      ...(onChange
        ? {
            onInput({ value: newValue }) {
              if (value !== newValue) {
                onChange(newValue)

                // if (controlled) {
                //   useLayoutEffect(() => {
                //     if (newValue !== value) {
                //       input.current?.setValue(value || '')
                //       input.current?.setSelection(true, { collapse: 'end' })
                //     }
                //   })
                // }
              }
            }
          }
        : {}),
      patch,
      highlight
    })

    setValue(value)

    return () => {
      input.current?.dispose()
    }
  }, [])

  useEffect(() => {
    input.current?.refresh()
  }, [multiline, readonly, disabled])

  useEffect(() => {
    setValue(value)
  }, [value])

  function setValue(value: string = '') {
    input.current?.setValue(value)
  }

  return (
    <highlightable-input
      ref={root}
      aria-multiline={props.multiline || null}
      aria-readonly={props.readonly || null}
      aria-disabled={props.disabled || null}
      data-theme={props.theme || null}
      {...restProps}
    />
  )
}
Component.displayName = 'HighlightableInput'

export default Component
