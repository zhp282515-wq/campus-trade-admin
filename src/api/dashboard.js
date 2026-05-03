import request from './request'

export function getDashboardStats() {
  return request.get('/dashboard')
}

export function getDashboardCards() {
  return request.get('/dashboard')
}
