const TOKEN_KEY = 'campus_trade_token'
const USER_INFO_KEY = 'campus_trade_user'

function getStorageItem(key) {
  return localStorage.getItem(key)
}

function setStorageItem(key, value) {
  localStorage.setItem(key, value)
}

function removeStorageItem(key) {
  localStorage.removeItem(key)
}

export function getToken() {
  return getStorageItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  setStorageItem(TOKEN_KEY, token || '')
}

export function removeToken() {
  removeStorageItem(TOKEN_KEY)
}

export function getUserInfo() {
  const text = getStorageItem(USER_INFO_KEY)

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    clearAuthStorage()
    return null
  }
}

export function setUserInfo(userInfo) {
  setStorageItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export function removeUserInfo() {
  removeStorageItem(USER_INFO_KEY)
}

export function getAuthStorage() {
  return {
    token: getToken(),
    userInfo: getUserInfo()
  }
}

export function setAuthStorage(token, userInfo) {
  setToken(token)
  setUserInfo(userInfo)
}

export function clearAuthStorage() {
  removeToken()
  removeUserInfo()
}

export function getLoginUser() {
  return getUserInfo()
}

export function setLoginUser(user) {
  setUserInfo(user)
}

export function clearLoginUser() {
  clearAuthStorage()
}
