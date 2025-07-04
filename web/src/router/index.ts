import { createRouter, createWebHistory } from 'vue-router'
import Character from '@/views/Character.vue'
import NPCs from '@/views/NPCs.vue'
import Map from '@/views/Map.vue'
import Inventory from '@/views/Inventory.vue'
import Journal from '@/views/Journal.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/character'
    },
    {
      path: '/character',
      name: 'Character',
      component: Character
    },
    {
      path: '/npcs',
      name: 'NPCs', 
      component: NPCs
    },
    {
      path: '/map',
      name: 'Map',
      component: Map
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: Inventory
    },
    {
      path: '/journal',
      name: 'Journal',
      component: Journal
    }
  ]
})

export default router 