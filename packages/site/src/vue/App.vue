<script setup>
import { onMounted, ref } from 'vue'
import HighlightableInput from 'highlightable-input/vue'
import { rules } from '../highlight'

const text = ref('Hello world!')
const vueTheme = ref('none')

const multiline = ref(false)
const readonly = ref(false)
const disabled = ref(false)

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
    :highlight="rules"
    :multiline="multiline"
    :readonly="readonly"
    :disabled="disabled"
  />
</template>
