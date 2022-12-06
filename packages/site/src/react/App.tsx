import { useState, useEffect } from 'react'
import HighlightableInput from 'highlightable-input/react'
import { rules } from '../highlight'

export default function App() {
  const [text, setText] = useState('Hello world!')
  const [theme, setTheme] = useState('none')

  const [multiline, setMultiline] = useState(false)
  const [readonly, setReadonly] = useState(false)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (readonly) {
      setDisabled(false)
    }
  }, [readonly])

  useEffect(() => {
    if (disabled) {
      setReadonly(false)
    }
  }, [disabled])

  useEffect(() => {
    window.registerReactApp((theme) => {
      setTheme(theme)
    })
  }, [])

  return (
    <>
      <h2>
        <label htmlFor="react">React App</label>
        <img src="/react.svg" height="16" />
      </h2>
      <section className="settings">
        <label>
          <input
            type="checkbox"
            checked={multiline}
            onChange={(e) => setMultiline(e.target.checked)}
          />
          Multiline
        </label>
        <label>
          <input
            type="checkbox"
            checked={readonly}
            onChange={(e) => setReadonly(e.target.checked)}
          />
          Readonly
        </label>
        <label>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          Disabled
        </label>
      </section>
      <HighlightableInput
        id="react"
        theme={theme}
        value={text}
        highlight={rules}
        multiline={multiline}
        readonly={readonly}
        disabled={disabled}
        onChange={(value) => setText(value)}
      />
    </>
  )
}
