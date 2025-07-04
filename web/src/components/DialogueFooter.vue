<template>
  <footer class="bg-white/80 backdrop-blur-md border-t border-gray-300 p-4">
    <p class="text-base leading-relaxed truncate">
      {{ dialogue }}
    </p>
  </footer>
</template>

<script setup lang="ts">
defineProps<{ dialogue: string }>()
</script> 