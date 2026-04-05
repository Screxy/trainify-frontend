<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import type { Component } from 'vue'
import AppButton from './AppButton.vue'

interface Props {
  icon?: Component
  title: string
  description?: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  icon: () => Inbox,
  description: '',
  actionText: '',
})

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 rounded-xl bg-bg-card p-10">
    <component :is="icon" :size="48" class="text-text-secondary" />
    <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
    <p v-if="description" class="max-w-[280px] text-center text-sm text-text-secondary">
      {{ description }}
    </p>
    <AppButton v-if="actionText" size="m" @click="$emit('action')">
      {{ actionText }}
    </AppButton>
  </div>
</template>
