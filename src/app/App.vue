<script setup lang="ts">
import ToastContainer from '@/shared/ui/ToastContainer.vue'
import PwaUpdatePrompt from '@/shared/ui/PwaUpdatePrompt.vue'
</script>

<template>
  <router-view />
  <ToastContainer />
  <PwaUpdatePrompt />
</template>
