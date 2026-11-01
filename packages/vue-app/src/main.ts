import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Vue SFC type not resolved by typescript-eslint parser
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
