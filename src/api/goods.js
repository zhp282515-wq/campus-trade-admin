import request from './request'

export function getGoodsList(params = {}) {
  return request.get('/goods', { params })
}

export function getGoodsDetail(id) {
  return request.get(`/goods/${id}`)
}

export function createGoods(data) {
  return request.post('/goods', data)
}

export function updateGoods(id, data) {
  return request.put(`/goods/${id}`, data)
}

export function deleteGoods(id) {
  return request.delete(`/goods/${id}`)
}

export function updateGoodsStatus(id, status) {
  return request.put(`/goods/${id}/status`, { status })
}
