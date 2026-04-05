<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  variant: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
  close()
}
</script>

<template>
  <AppModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div class="flex flex-col gap-5">
      <div class="flex items-start gap-3">
        <TriangleAlert :size="24" class="shrink-0 text-warning" />
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
          <p class="text-sm text-text-secondary">{{ message }}</p>
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <AppButton variant="secondary" size="m" @click="close">
          {{ cancelText }}
        </AppButton>
        <AppButton :variant="variant === 'danger' ? 'danger' : 'primary'" size="m" @click="confirm">
          {{ confirmText }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
