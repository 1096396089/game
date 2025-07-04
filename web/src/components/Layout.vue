<template>
  <el-container class="h-screen">
    <!-- 移动端菜单按钮 -->
    <div class="lg:hidden fixed top-0 left-0 z-20 m-4">
      <el-button size="large" @click="toggleSidebar" class="p-1 rounded-md bg-white shadow-md">
        <el-icon>
          <Menu />
        </el-icon>
      </el-button>
    </div>

    <!-- 移动端弹出侧边栏的遮罩层 -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
    ></div>

    <!-- Aside -->
    <el-aside
      :class="[
        'bg-white shadow-md z-20 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'fixed lg:static h-full',
      ]"
      :width="isCollapse ? '64px' : '256px'"
    >
      <!-- Logo -->
      <div class="flex items-center px-4 py-6">
        <div class="flex items-center">
          <div class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
            <el-icon :size="20">
              <Grid />
            </el-icon>
          </div>
          <span class="ml-2 text-xl font-semibold" v-if="!isCollapse">管理系统</span>
        </div>
      </div>

      <!-- Navigation -->
      <el-menu
        :default-active="route.path"
        class="border-0 el-menu-vertical"
        router
        :collapse="isCollapse"
      >
        <!-- 处理有子菜单的情况 -->
        <template v-for="(item, index) in navigationItems" :key="index">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
            <template #title>
              <el-icon><component :is="item.iconComponent" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            
            <el-menu-item 
              v-for="(child, childIndex) in item.children" 
              :key="childIndex"
              :index="'/' + child.fullPath"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 没有子菜单 -->
          <el-menu-item
            v-else
            :index="'/' + item.path"
            class="!py-3 relative"
          >
            <el-icon>
              <component :is="item.iconComponent" />
            </el-icon>

            <template #title>
              <div class="flex items-center justify-between w-full">
                <span>{{ item.title }}</span>
              </div>
            </template>
          </el-menu-item>
        </template>
      </el-menu>

      <!-- User Info -->
      <!-- <div class="absolute bottom-0 w-full bg-white border-t border-gray-200">
        <div class="flex items-center p-4">
          <el-avatar :size="40" class="bg-gray-300 text-gray-700 font-semibold">
            {{ userInitials }}
          </el-avatar>
          <div v-if="!isCollapse" class="ml-3 transition-opacity duration-300">
            <p class="text-sm font-medium">{{ userName }}</p>
            <p class="text-xs text-gray-500">{{ userEmail }}</p>
          </div>
          <el-button class="ml-auto" circle text>
            <el-icon>
              <MoreFilled />
            </el-icon>
          </el-button>
        </div>
      </div> -->
    </el-aside>

    <!-- Container -->
    <el-container>
      <!-- Header -->
      <el-header class="bg-white shadow-sm sticky top-0 z-10 p-0">
        <div class="flex items-center justify-between px-4 lg:px-6 py-3">
          <div class="flex-1 flex items-center">
            <!-- 折叠按钮（在桌面端显示） -->
            <el-button
              class="mr-4 hidden lg:block"
              @click="toggleCollapse"
              type="primary"
              size="small"
              circle
            >
              <el-icon>
                <component :is="isCollapse ? Expand : Fold" />
              </el-icon>
            </el-button>
            <h1 class="text-lg font-semibold text-gray-800">{{ currentPageTitle }}</h1>
          </div>
          <div class="flex items-center ml-4 space-x-4">
            <!-- 用户角色信息 -->
            <div class="hidden md:block">
              <el-tag v-for="role in authStore.userInfo?.roles" :key="role" size="small" class="mr-1">
                {{ getRoleName(role) }}
              </el-tag>
            </div>

            <!-- 用户头像菜单 -->
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="cursor-pointer">
                <el-avatar :size="40" class="bg-gray-200 text-gray-700 font-semibold">
                  {{ userInitials }}
                </el-avatar>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <div class="text-gray-700">{{ authStore.userInfo?.realName || authStore.userInfo?.username }}</div>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <span class="text-red-600">退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <!-- Main -->
      <el-main class="bg-gray-100 lg:p-6">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Money,
  Menu,
  Grid,
  Files,
  Fold,
  Expand,
  Folder,
  User,
  Document,
  Setting,
  Wallet
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { menuItems } from '@/router/menu'
import { hasRole } from '@/util/permission'
import { ROLE_NAMES } from '@/util/permission'

// 使用当前路由和认证store
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()


// 控制侧边栏是否展开（移动端）
const isSidebarOpen = ref(false)

// 控制侧边栏是否折叠
const isCollapse = ref(false)

// 图标组件映射
const iconMap = {
  'User': User,
  'Document': Document,
  'Money': Money,
  'Folder': Folder,
  'Wallet': Wallet,
  'Setting': Setting
}

// 定时刷新待审核数量
let refreshTimer: number | null = null

onMounted(() => {
})

onUnmounted(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
})

// 切换侧边栏显示状态（移动端）
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 切换折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 在组件挂载时获取用户信息
onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.userInfo) {
    await authStore.fetchUserInfo()
  }
})

// 处理用户菜单命令
const handleCommand = (command: string) => {
  switch (command) {

    case 'logout':
      // 处理退出登录
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          authStore.logout()
          ElMessage.success('已成功退出登录')
          router.push('/login')
        })
        .catch(() => {})
      break
  }
}

// 根据用户角色过滤菜单
const navigationItems = computed(() => {
  return menuItems
    .filter(item => {
      // 如果没有定义角色限制，所有人可见
      if (!item.roles || item.roles.length === 0) return true;
      
      // 检查用户是否有权限访问
      return hasRole(item.roles);
    })
    .map(item => ({
      title: item.title,
      path: item.path,  // 保留原始path
      iconComponent: iconMap[item.icon as keyof typeof iconMap] || Document,
      children: item.children
        ?.filter(child => {
          // 如果没有定义角色限制，所有人可见
          if (!child.roles || child.roles.length === 0) return true;
          
          // 检查用户是否有权限访问
          return hasRole(child.roles);
        })
        .map(child => ({
          ...child,
          // 子菜单直接使用自己的path，不拼接父级路径
          fullPath: child.path
        }))
    }));
});

// 获取当前页面标题
const currentPageTitle = computed(() => {
  const currentPath = route.path;
  
  // 查找匹配的导航项
  for (const item of navigationItems.value) {
    // 检查一级菜单匹配
    if ('/' + item.path === currentPath) {
      return item.title;
    }
    
    // 检查子菜单匹配
    if (item.children) {
      for (const child of item.children) {
        if ('/' + child.fullPath === currentPath) {
          return child.title;
        }
      }
    }
  }
  
  return '管理系统';
});

// 用户信息
const userName = computed(() => {
  return authStore.userInfo?.realName || authStore.userInfo?.username || '管理员用户'
})
const userEmail = ref('admin@example.com')
const userInitials = computed(() => {
  return userName.value.substring(0, 2)
})

// 获取角色名称
const getRoleName = (role: string) => {
  return ROLE_NAMES[role] || role;
}
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 覆盖 Element Plus 菜单样式 */
:deep(.el-menu-item.is-active) {
  background-color: #f3f4f6 !important;
  color: #000 !important;
  font-weight: bold !important;
  border-left: 4px solid #000 !important;
}

:deep(.el-menu-item:hover) {
  background-color: #f3f4f6 !important;
  color: #000 !important;
}

:deep(.el-menu-item) {
  border-left: 4px solid transparent;
}

:deep(.el-menu) {
  border-right: none !important;
}

/* Element Plus Container 样式覆盖 */
:deep(.el-container) {
  height: 100vh;
}

:deep(.el-aside) {
  background-color: white;
}

:deep(.el-header) {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
}

:deep(.el-main) {
  background-color: #f3f4f6;
  padding: 1rem;
}

/* 金额相关样式 */
:deep(.money-amount) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 徽标样式调整 */
:deep(.el-badge__content.is-fixed) {
  top: 50% !important;
  transform: translateY(-50%) !important;
  right: 25px !important;
  z-index: 10 !important;
  position: absolute !important;
}

:deep(.el-menu--collapse .el-badge__content.is-fixed) {
  right: 5px !important;
}

:deep(.el-badge__content.el-badge__content--danger) {
  background-color: #ff4949 !important;
  padding: 0 6px !important;
  height: 18px !important;
  line-height: 18px !important;
  border-radius: 9px !important;
  font-size: 12px !important;
  display: inline-block !important;
}

/* 菜单项徽标位置调整 */
:deep(.el-menu-item.relative) {
  position: relative !important;
  overflow: visible !important;
}

/* 添加自定义徽标样式 */
.badge-dot {
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  z-index: 10 !important;
  min-width: 16px !important;
  height: 16px !important;
  border-radius: 8px !important;
  background-color: #ff4949 !important;
  color: white !important;
  font-size: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 4px !important;
}

:deep(.el-menu--collapse) .badge-dot {
  right: 5px !important;
}
</style>
