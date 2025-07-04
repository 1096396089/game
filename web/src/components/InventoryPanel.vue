<template>
  <aside class="w-1/4 max-w-sm bg-white/70 backdrop-blur-md border-l border-gray-300 p-4 overflow-y-auto">
    <h2 class="text-2xl font-bold mb-4">道具栏</h2>
    <ul class="grid grid-cols-2 gap-4">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex flex-col items-center text-center"
      >
        <img
          :src="item.icon"
          :alt="item.name"
          class="w-16 h-16 object-contain mb-2"
        />
        <span class="text-sm">{{ item.name }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
interface Item {
  id: number
  name: string
  icon: string
}

defineProps<{ items: Item[] }>()
</script> 