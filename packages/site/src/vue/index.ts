import { createApp } from "vue";
import App from "./App.vue";

export default function mount() {
  createApp(App).mount("#vue-app");
}
