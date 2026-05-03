import request from './request'

export function getCollegeList(params = {}) {
  return request.get('/colleges', { params })
}

export function createCollege(data) {
  return request.post('/colleges', data)
}

export function updateCollege(id, data) {
  return request.put(`/colleges/${id}`, data)
}

export function deleteCollege(id) {
  return request.delete(`/colleges/${id}`)
}

export function updateCollegeStatus(id, status) {
  return request.put(`/colleges/${id}/status`, { status })
}
