<template>
  <div class="w-screen h-screen flex flex-col overflow-hidden" style="font-family: 'FangSong', 'Noto Serif SC', serif;">
    <!-- Main section: side panels + map -->
    <div class="relative flex flex-1 overflow-hidden bg-gray-200">
      <!-- Toolbar buttons -->
      <div class="absolute top-4 left-4 z-50 flex flex-col space-y-2">
        <button @click="showTask = !showTask" class="px-3 py-1 rounded bg-white/70 backdrop-blur-md shadow hover:bg-white">任务</button>
        <button @click="showInventory = !showInventory" class="px-3 py-1 rounded bg-white/70 backdrop-blur-md shadow hover:bg-white">道具</button>
        <button @click="showProfile = !showProfile" class="px-3 py-1 rounded bg-white/70 backdrop-blur-md shadow hover:bg-white">信息</button>
      </div>

      <!-- 仅放置地图，占满主区域 -->
      <MapCanvas />
    </div>

    <!-- Element Plus Dialogs -->
    <el-dialog v-model="showTask" title="任务" width="400px" destroy-on-close>
      <div class="space-y-3">
        <div v-for="task in tasks" :key="task.id" class="border p-3 rounded">
          <h3 class="font-semibold text-lg">{{ task.title }}</h3>
          <p class="text-sm mt-1">{{ task.desc }}</p>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="showInventory" title="道具" width="400px" destroy-on-close>
      <ul class="grid grid-cols-3 gap-4">
        <li v-for="item in items" :key="item.id" class="flex flex-col items-center">
          <img :src="item.icon" :alt="item.name" class="w-12 h-12 mb-1" />
          <span class="text-sm">{{ item.name }}</span>
        </li>
      </ul>
    </el-dialog>

    <el-dialog v-model="showProfile" title="个人信息" width="400px" destroy-on-close>
      <div class="space-y-2 text-sm">
        <p><strong>姓名：</strong> 少侠</p>
        <p><strong>门派：</strong> 华山派</p>
        <p><strong>等级：</strong> 15</p>
        <p><strong>声望：</strong> 侠名远扬</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapCanvas from './components/MapCanvas.vue'
import DialogueFooter from './components/DialogueFooter.vue'

/* 模拟任务数据 */
const tasks = ref([
  { id: 1, title: '初入江湖', desc: '拜访青城派掌门，获取入门秘籍。' },
  { id: 2, title: '追踪线索', desc: '前往洛阳，寻找失踪的飞鹰令。' },
  { id: 3, title: '守护古籍', desc: '保护少林寺藏经阁，抵御盗贼。' },
])

/* 模拟道具数据 */
const items = ref([
  {
    id: 1,
    name: '玉蜂针',
    icon: 'https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/hexagon.svg',
  },
  {
    id: 2,
    name: '九阳真经',
    icon: 'https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/book.svg',
  },
  {
    id: 3,
    name: '小还丹',
    icon: 'https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/pill.svg',
  },
  {
    id: 4,
    name: '玄铁剑',
    icon: 'https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/sword.svg',
  },
])

/* 模拟剧情对话 */
const dialogues = [
  '【系统】你来到了江湖的边缘，前路未知。',
  '【NPC】少侠，请留步！掌门有请。',
  '【系统】你获得了新任务：初入江湖',
]

const currentDialogue = ref(dialogues[0])

// panel visibility state
const showTask = ref(false)
const showInventory = ref(false)
const showProfile = ref(false)
</script>

<!-- 这里仅放与全局无冲突的少量样式 -->
<style>
/* 禁止页面选中，营造沉浸感 */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* slide-left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* slide-right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
