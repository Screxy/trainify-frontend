<script setup lang="ts">
import TheSidebar from '@/widgets/sidebar/TheSidebar.vue'
import TheBottomNav from '@/widgets/bottom-nav/TheBottomNav.vue'
</script>

<template>
  <div class="flex min-h-screen bg-bg">
    <TheSidebar />
    <main class="flex-1 overflow-auto pb-24 md:pb-0">
      <router-view />
    </main>
    <TheBottomNav />
  </div>
</template>
