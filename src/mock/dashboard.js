export const mockDashboard = {
  totalUsers: 20,
  totalGoods: 40,
  todayOrders: 6,
  pendingAudit: 7,
  orderTrend: [
    { date: '04-20', count: 2 },
    { date: '04-21', count: 3 },
    { date: '04-22', count: 3 },
    { date: '04-23', count: 3 },
    { date: '04-24', count: 4 },
    { date: '04-25', count: 5 },
    { date: '04-26', count: 6 }
  ],
  categoryStats: [
    { name: '教材资料', value: 9 },
    { name: '数码产品', value: 8 },
    { name: '生活用品', value: 8 },
    { name: '运动器材', value: 5 },
    { name: '服饰鞋包', value: 6 },
    { name: '其他', value: 4 }
  ],
  collegeStats: [
    { name: '计算机学院', value: 5 },
    { name: '商学院', value: 5 },
    { name: '艺术学院', value: 5 },
    { name: '体育学院', value: 5 },
    { name: '外国语学院', value: 4 },
    { name: '机械工程学院', value: 4 },
    { name: '信息工程学院', value: 4 },
    { name: '数学学院', value: 3 },
    { name: '文学院', value: 3 },
    { name: '法学院', value: 2 }
  ],
  goodsStatusStats: [
    { name: '在售', value: 17 },
    { name: '已售', value: 7 },
    { name: '待审核', value: 7 },
    { name: '已下架', value: 5 },
    { name: '审核驳回', value: 4 }
  ]
}

export const mockDashboardCards = [
  {
    title: '用户总数',
    value: mockDashboard.totalUsers,
    icon: '人',
    color: '#2f7cf6'
  },
  {
    title: '商品总数',
    value: mockDashboard.totalGoods,
    icon: '物',
    color: '#35c46f'
  },
  {
    title: '今日订单',
    value: mockDashboard.todayOrders,
    icon: '单',
    color: '#ff9f43'
  },
  {
    title: '待审核商品',
    value: mockDashboard.pendingAudit,
    icon: '审',
    color: '#8e67e8'
  }
]
