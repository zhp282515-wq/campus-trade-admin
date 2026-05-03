function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

export function success(data = null, message = 'success') {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message,
        data: clone(data)
      })
    }, 200)
  })
}

export function fail(message = '请求失败', code = 400) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject({
        code,
        message,
        data: null
      })
    }, 200)
  })
}

export function paginate(list, params = {}) {
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    list: list.slice(start, end),
    total: list.length,
    page,
    pageSize
  }
}

export function includesText(value, keyword) {
  if (!keyword) {
    return true
  }

  return String(value || '')
    .toLowerCase()
    .includes(String(keyword).toLowerCase())
}

export function getNextId(list) {
  if (list.length === 0) {
    return 1
  }

  return Math.max(...list.map((item) => Number(item.id) || 0)) + 1
}

export function formatDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
