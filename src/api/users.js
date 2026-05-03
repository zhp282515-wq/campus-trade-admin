import request from './request'

export function getUserList(params = {}) {
  return request.get('/users', { params })
}

export function getUserDetail(id) {
  return request.get(`/users/${id}`)
}

export function updateUserStatus(id, status) {
  return request.put(`/users/${id}/status`, { status })
}
