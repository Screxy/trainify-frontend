import { ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  variant: ToastVariant
  message: string
}

let nextId = 0
export const toasts = ref<ToastMessage[]>([])

function addToast(variant: ToastVariant, message: string, duration = 4000) {
  const id = nextId++
  toasts.value.push({ id, variant, message })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, duration)
}

export function useToast() {
  return {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
  }
}
