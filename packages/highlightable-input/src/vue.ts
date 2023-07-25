import {
  defineComponent,
  h,
  ref,
  onMounted,
  watch,
  nextTick,
  type PropType,
  onBeforeUnmount,
  computed
} from 'vue'
import { setup, type HighlightableInput, type SetupOptions } from './index'

export default defineComponent({
  props: {
    defaultValue: String,
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
    const controlled = computed(() => props.modelValue !== undefined)
    const local = ref(props.modelValue ?? props.defaultValue)
    const real = computed(
      () => (controlled.value ? props.modelValue : local.value) || ''
    )

    onMounted(() => {
      if (!root.value) {
        return
      }

      input.value = setup(root.value, {
        defaultValue: real.value,
        onInput({ value }) {
          if (value !== real.value) {
            emit('update:modelValue', value)

            if (controlled.value) {
              nextTick(() => {
                if (value !== real.value) {
                  setValue(real.value)
                }
              })
            } else {
              local.value = value
            }
          }
        },
        patch: props.patch,
        highlight: props.highlight
      })
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
      () => real.value,
      (newValue) => {
        setValue(newValue)
      }
    )

    function setValue(value: string) {
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
