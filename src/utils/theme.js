const THEME_KEY = 'campus_trade_theme'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || LIGHT_THEME
}

export function setTheme(theme) {
  const nextTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME

  document.documentElement.setAttribute('data-theme', nextTheme)
  localStorage.setItem(THEME_KEY, nextTheme)

  return nextTheme
}

export function toggleTheme() {
  const nextTheme = getTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME
  return setTheme(nextTheme)
}

export function initTheme() {
  setTheme(getTheme())
}
