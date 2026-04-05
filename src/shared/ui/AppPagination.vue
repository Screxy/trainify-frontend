<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = computed(() => {
  const result: (number | '...')[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 5) {
    for (let i = 1; i <= total; i++) result.push(i)
  } else {
    result.push(1)
    if (current > 3) result.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) result.push(i)
    if (current < total - 2) result.push('...')
    result.push(total)
  }
  return result
})
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center gap-1">
    <button
      class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-hover disabled:opacity-30"
      :disabled="currentPage === 1"
      @click="emit('update:currentPage', currentPage - 1)"
    >
      <ChevronLeft :size="16" />
    </button>
    <template v-for="(page, i) in pages" :key="i">
      <span v-if="page === '...'" class="px-1 text-sm text-text-secondary">...</span>
      <button
        v-else
        class="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors"
        :class="page === currentPage
          ? 'bg-accent text-bg font-semibold'
          : 'text-text-secondary hover:bg-bg-hover'"
        @click="emit('update:currentPage', page)"
      >
        {{ page }}
      </button>
    </template>
    <button
      class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-hover disabled:opacity-30"
      :disabled="currentPage === totalPages"
      @click="emit('update:currentPage', currentPage + 1)"
    >
      <ChevronRight :size="16" />
    </button>
  </div>
</template>
