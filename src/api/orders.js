import request from './request'

export function getOrderList(params = {}) {
  return request.get('/orders', { params })
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`)
}

export function updateOrderStatus(id, status) {
  return request.put(`/orders/${id}/status`, { status })
}
