<script setup>
import { onMounted, ref, watch } from 'vue'
import HighlightableInput from 'highlightable-input/vue'
import { tweet } from '../rules'

const text = ref('Hello Mayor @Goodway!')
const vueTheme = ref('none')

const multiline = ref(false)
const readonly = ref(false)
const disabled = ref(false)

watch(readonly, (value) => {
  if (value) {
    disabled.value = false
  }
})

watch(disabled, (value) => {
  if (value) {
    readonly.value = false
  }
})

onMounted(() => {
  window.registerVueApp((theme) => {
    vueTheme.value = theme
  })
})
</script>

<template>
  <h2><label for="vue">Vue App</label><img src="/vue.svg" height="16" /></h2>
  <section class="settings">
    <label><input type="checkbox" v-model="multiline" />Multiline</label>
    <label><input type="checkbox" v-model="readonly" />Readonly</label>
    <label><input type="checkbox" v-model="disabled" />Disabled</label>
  </section>
  <HighlightableInput
    id="vue"
    :theme="vueTheme"
    v-model="text"
    :highlight="tweet"
    :multiline="multiline"
    :readonly="readonly"
    :disabled="disabled"
    :rows="multiline ? 3 : undefined"
  />
</template>
