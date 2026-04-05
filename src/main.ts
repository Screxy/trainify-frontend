import { createApp } from 'vue'
import { App, router, pinia } from '@/app'
import '@/app/styles/index.css'
import { useAuthStore } from '@/features/auth'

const app = createApp(App)

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
