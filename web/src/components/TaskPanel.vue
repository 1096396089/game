<template>
  <aside class="w-1/4 max-w-sm bg-white/70 backdrop-blur-md border-r border-gray-300 p-4 overflow-y-auto">
    <h2 class="text-2xl font-bold mb-4">任务面板</h2>
    <ul class="space-y-3">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="p-3 bg-white/60 rounded-md shadow-sm hover:bg-white/80 transition"
      >
        <h3 class="text-lg font-semibold">{{ task.title }}</h3>
        <p class="text-sm mt-1 leading-relaxed">{{ task.desc }}</p>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
interface Task {
  id: number
  title: string
  desc: string
}

const props = defineProps<{ tasks: Task[] }>()
</script> 