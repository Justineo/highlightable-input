import {
  defineComponent,
  h,
  ref,
  onMounted,
  watch,
  nextTick,
  type PropType,
  onBeforeUnmount
} from 'vue'
import { setup, type HighlightableInput, type SetupOptions } from './index'

export default defineComponent({
  props: {
    modelValue: String,
    multiline: Boolean,
    readonly: Boolean,
    disabled: Boolean,
    theme: String,
    highlight: {
      type: Object as PropType<SetupOptions['highlight']>,
      required: true
    },
    patch: Function as PropType<SetupOptions['patch']>
  },
  setup(props, { emit }) {
    const root = ref<HTMLElement>()
    const input = ref<HighlightableInput>()
    const controlled = ref(props.modelValue !== undefined)

    onMounted(() => {
      if (!root.value) {
        return
      }

      input.value = setup(root.value, {
        onInput({ value }) {
          if (value !== props.modelValue) {
            emit('update:modelValue', value)

            if (controlled.value) {
              nextTick(() => {
                if (value !== props.modelValue) {
                  input.value?.setValue(props.modelValue || '')
                  input.value?.setSelection(true, { collapse: 'end' })
                }
              })
            }
          }
        },
        patch: props.patch,
        highlight: props.highlight
      })

      setValue(props.modelValue)
    })

    onBeforeUnmount(() => {
      input.value?.dispose()
    })

    watch(
      () => [props.multiline, props.readonly, props.disabled],
      () => {
        // Should rebind after DOM change
        nextTick(() => {
          input.value?.refresh()
        })
      }
    )

    watch(
      () => props.modelValue,
      (newValue) => {
        setValue(newValue)
      }
    )

    function setValue(value: string = '') {
      input.value?.setValue(value)
    }

    return () =>
      h('highlightable-input', {
        ref: root,
        'aria-multiline': props.multiline || null,
        'aria-readonly': props.readonly || null,
        'aria-disabled': props.disabled || null,
        'data-theme': props.theme || null
      })
  }
})
