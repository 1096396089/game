<template>
  <!-- 可拖动/滚动的大地图容器 -->
  <section class="relative flex-1 w-full h-full overflow-hidden">
    <div
      ref="container"
      class="w-full h-full overflow-auto cursor-grab select-none"
      @mousedown="onDragStart"
      @mousemove="onDrag"
      @mouseup="onDragEnd"
      @mouseleave="onDragEnd"
      @wheel="onWheel"
      :class="{ 'cursor-grabbing': dragging }"
    >
      <!-- 包裹地图与锚点的可缩放容器 -->
      <div
        ref="wrapper"
        class="relative inline-block"
        :style="wrapperStyle"
      >
        <!-- 地图底图 -->
        <img
          ref="imgRef"
          src="../assets/map1.png"
          alt="世界地图占位图"
          class="block select-none pointer-events-none w-full h-full"
        />

        <!-- 交互锚点 -->
        <div
          v-for="m in markers"
          :key="m.id"
          class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition"
          :style="{ left: m.x + '%', top: m.y + '%' }"
          @click="onMarkerClick(m)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="red"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="drop-shadow-md"
          >
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from 'vue'

const container = ref<HTMLDivElement | null>(null)
const wrapper = ref<HTMLDivElement | null>(null)
const scale = ref(1)
const imgRef = ref<HTMLImageElement | null>(null)

const MAX_SCALE = 3
const minScale = ref(0.5)

// 拖拽平移逻辑
const dragging = ref(false)
let startX = 0
let startY = 0
let startScrollLeft = 0
let startScrollTop = 0

function clampScroll() {
  if (!container.value) return
  const el = container.value
  const maxX = el.scrollWidth - el.clientWidth
  const maxY = el.scrollHeight - el.clientHeight
  el.scrollLeft = Math.min(Math.max(0, el.scrollLeft), maxX)
  el.scrollTop = Math.min(Math.max(0, el.scrollTop), maxY)
}

function onDragStart(e: MouseEvent) {
  if (!container.value || e.button !== 0) return
  e.preventDefault()
  dragging.value = true
  startX = e.clientX
  startY = e.clientY
  startScrollLeft = container.value.scrollLeft
  startScrollTop = container.value.scrollTop

  // 监听窗口级别事件，确保拖动即便移出容器也持续
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', onDragEnd)
}

function onDrag(e: MouseEvent) {
  if (!dragging.value || !container.value) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  container.value.scrollLeft = startScrollLeft - dx
  container.value.scrollTop = startScrollTop - dy
  clampScroll()
}

function onDragEnd() {
  dragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', onDragEnd)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = -e.deltaY
  const zoomFactor = delta > 0 ? 1.1 : 0.9
  const newScale = Math.min(MAX_SCALE, Math.max(minScale.value, scale.value * zoomFactor))

  // 计算缩放中心，让鼠标位置保持相对地图一致
  if (imgRef.value && container.value) {
    const rect = imgRef.value.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    const percentX = offsetX / rect.width
    const percentY = offsetY / rect.height

    const prevWidth = rect.width
    const prevHeight = rect.height

    scale.value = newScale

    nextTick(() => {
      if (!imgRef.value || !container.value) return
      const newRect = imgRef.value.getBoundingClientRect()
      const dx = (newRect.width - prevWidth) * percentX
      const dy = (newRect.height - prevHeight) * percentY
      container.value!.scrollLeft += dx
      container.value!.scrollTop += dy
      clampScroll()
    })
  }
}

function updateMinScale() {
  if (!container.value) return
  const el = container.value
  const wRatio = el.clientWidth / 2560 // original width
  const hRatio = el.clientHeight / 1440 // original height
  minScale.value = Math.max(wRatio, hRatio, 0.2) // ensure at least 0.2
  if (scale.value < minScale.value) scale.value = minScale.value
}

// 锚点示例数据 (百分比坐标)
interface Marker {
  id: number
  name: string
  x: number // 百分比
  y: number
}

const markers: Marker[] = [
  { id: 1, name: '洛阳', x: 45, y: 38 },
  { id: 2, name: '少林寺', x: 62, y: 70 },
  { id: 3, name: '华山', x: 30, y: 25 },
]

function onMarkerClick(m: Marker) {
  window.alert(`你点击了「${m.name}」！`)
}

const wrapperStyle = computed(() => ({
  width: `${2560 * scale.value}px`,
  height: `${1440 * scale.value}px`,
}))

onMounted(() => {
  if (container.value) {
    updateMinScale()
    // 初始居中显示地图
    const el = container.value
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2

    // 监听窗口尺寸变化，调整最小缩放
    const resizeObserver = new ResizeObserver(() => updateMinScale())
    resizeObserver.observe(el)
  }
})
</script>

<style scoped>
/* 隐藏滚动条（可选） */
::-webkit-scrollbar {
  display: none;
}
</style> 