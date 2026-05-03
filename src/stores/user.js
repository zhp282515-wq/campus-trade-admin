import { defineStore } from 'pinia'
import { login } from '../api/auth'
import {
  clearAuthStorage,
  getAuthStorage,
  setAuthStorage
} from '../utils/auth'

function createMockToken(userInfo) {
  return `mock-token-${userInfo.username}-${Date.now()}`
}

function getInitialState() {
  const { token, userInfo } = getAuthStorage()

  return {
    token,
    username: userInfo?.username || '',
    nickname: userInfo?.nickname || '',
    role: userInfo?.role || ''
  }
}

export const useUserStore = defineStore('user', {
  state: () => getInitialState(),
  getters: {
    isLogin: (state) => {
      return Boolean(state.token)
    },
    userInfo: (state) => {
      return {
        token: state.token,
        username: state.username,
        nickname: state.nickname,
        role: state.role
      }
    }
  },
  actions: {
    setUserInfo(userInfo) {
      this.token = userInfo.token || this.token
      this.username = userInfo.username || ''
      this.nickname = userInfo.nickname || ''
      this.role = userInfo.role || ''

      setAuthStorage(this.token, {
        username: this.username,
        nickname: this.nickname,
        role: this.role
      })
    },
    loadFromStorage() {
      const { token, userInfo } = getAuthStorage()

      this.token = token || ''
      this.username = userInfo?.username || ''
      this.nickname = userInfo?.nickname || ''
      this.role = userInfo?.role || ''
    },
    loginAction(data) {
      return login(data).then((res) => {
        const token = res.data.token || createMockToken(res.data)

        this.setUserInfo({
          token,
          username: res.data.username,
          nickname: res.data.nickname,
          role: res.data.role
        })

        return {
          ...res,
          data: this.userInfo
        }
      })
    },
    logoutAction() {
      this.token = ''
      this.username = ''
      this.nickname = ''
      this.role = ''
      clearAuthStorage()
    }
  }
})
