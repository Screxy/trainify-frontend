<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

interface Props {
  label: string
  modelValue: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  error: '',
  hint: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)
const isPassword = props.type === 'password'

const inputType = ref(isPassword ? 'password' : props.type)

function togglePassword() {
  showPassword.value = !showPassword.value
  inputType.value = showPassword.value ? 'text' : 'password'
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-[13px] font-medium text-[#94A3B8]">
      {{ label }}
    </label>
    <div
      class="flex h-10 items-center gap-2 rounded-lg border px-3"
      :class="[
        error
          ? 'border-[#EF4444] bg-[#252836]'
          : 'border-[#2D3748] bg-[#252836]',
      ]"
    >
      <input
        :type="inputType"
        :placeholder="placeholder"
        :value="modelValue"
        class="w-full bg-transparent text-sm text-[#F1F5F9] placeholder-[#94A3B8] outline-none"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="flex-shrink-0 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        @click="togglePassword"
      >
        <EyeOff v-if="showPassword" :size="18" />
        <Eye v-else :size="18" />
      </button>
    </div>
    <span v-if="error" class="text-xs text-[#EF4444]">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-[#94A3B8]">{{ hint }}</span>
  </div>
</template>
