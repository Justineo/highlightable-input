import {
  useRef,
  useEffect,
  useLayoutEffect,
  HTMLAttributes,
  useState
} from 'react'
import { setup, type HighlightableInput, type SetupOptions } from './index'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'highlightable-input': any
    }
  }
}

type HighlightableInputProps = {
  defaultValue?: string
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
    defaultValue,
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

  const controlled = value !== undefined
  const [localValue, setLocalValue] = useState<string | undefined>(
    value ?? defaultValue
  )
  const realValue = controlled ? value : localValue
  const [updateSignal, setUpdateSignal] = useState(0)

  useLayoutEffect(() => {
    if (!root.current) {
      return
    }

    input.current = setup(root.current, {
      defaultValue: realValue,
      onInput({ value }) {
        if (value !== realValue) {
          onChange?.(value)

          if (controlled) {
            setUpdateSignal((signal) => (signal + 1) % 2)
          } else {
            setLocalValue(value)
          }
        }
      },
      patch,
      highlight
    })

    return () => {
      input.current?.dispose()
    }
  }, [])

  useLayoutEffect(() => {
    if (controlled) {
      setValue(realValue)
    }
  }, [updateSignal])

  useEffect(() => {
    input.current?.refresh()
  }, [multiline, readonly, disabled])

  useEffect(() => {
    setValue(realValue)
  }, [value, realValue])

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
