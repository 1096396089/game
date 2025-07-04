import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/util/http'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const isAuthenticated = ref(!!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    isAuthenticated.value = true
  }

  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('token')
    isAuthenticated.value = false
    userInfo.value = null
  }

  const logout = () => {
    clearToken()
  }

  const fetchUserInfo = async () => {
    try {
      if (!token.value) return null
      const data = await http.get('/auth/user_info')
      userInfo.value = data
      return data
    } catch (error) {
      // console.error('获取用户信息失败:', error)
      clearToken()
      return null
    }
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    setToken,
    clearToken,
    logout,
    fetchUserInfo
  }
}) 