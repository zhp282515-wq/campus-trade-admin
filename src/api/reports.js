import request from './request'

export function getReportList(params = {}) {
  return request.get('/reports', { params })
}

export function getReportDetail(id) {
  return request.get(`/reports/${id}`)
}

export function updateReportStatus(id, status) {
  return request.put(`/reports/${id}/status`, { status })
}
