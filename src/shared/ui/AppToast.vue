<script setup lang="ts">
import { CheckCircle, XCircle, Info } from 'lucide-vue-next'
import type { ToastVariant } from '@/shared/lib/useToast'

interface Props {
  variant: ToastVariant
  message: string
}

defineProps<Props>()

const icons = { success: CheckCircle, error: XCircle, info: Info }
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-lg border bg-bg-card px-4 py-3 shadow-lg"
    :class="{
      'border-accent/25': variant === 'success',
      'border-error/25': variant === 'error',
      'border-info/25': variant === 'info',
    }"
  >
    <component
      :is="icons[variant]"
      :size="20"
      :class="{
        'text-accent': variant === 'success',
        'text-error': variant === 'error',
        'text-info': variant === 'info',
      }"
    />
    <span class="text-sm text-text-primary">{{ message }}</span>
  </div>
</template>
