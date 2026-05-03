<template>
  <PageContainer>
    <div v-loading="loading" class="dashboard-page">
      <h1 class="page-title">数据看板</h1>

      <div class="stats-grid">
        <StatCard
          v-for="item in cards"
          :key="item.title"
          :title="item.title"
          :value="item.value"
          :icon="item.icon"
          :color="item.color"
          :subtitle="item.subtitle"
        />
      </div>

      <div class="chart-grid">
        <section class="chart-card chart-card-wide">
          <div class="chart-title">最近 7 天订单趋势</div>
          <div ref="orderTrendRef" class="chart-box"></div>
        </section>

        <section class="chart-card">
          <div class="chart-title">商品分类占比</div>
          <div ref="categoryRef" class="chart-box"></div>
        </section>

        <section class="chart-card chart-card-wide">
          <div class="chart-title">各学院发布商品数量</div>
          <div ref="collegeRef" class="chart-box"></div>
        </section>

        <section class="chart-card">
          <div class="chart-title">商品状态统计</div>
          <div ref="statusRef" class="chart-box"></div>
        </section>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { markRaw, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { Goods, Tickets, User, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import PageContainer from '../components/PageContainer.vue'
import StatCard from '../components/StatCard.vue'
import { getDashboardStats } from '../api/dashboard'

const loading = ref(false)
const cards = shallowRef([])
const dashboard = ref(null)
const orderTrendRef = ref()
const categoryRef = ref()
const collegeRef = ref()
const statusRef = ref()
const chartInstances = []

function setCards(stats) {
  cards.value = [
    {
      title: '用户总数',
      value: stats.totalUsers,
      icon: markRaw(User),
      color: '#2f7cf6',
      subtitle: '校园注册用户'
    },
    {
      title: '商品总数',
      value: stats.totalGoods,
      icon: markRaw(Goods),
      color: '#35c46f',
      subtitle: '当前平台商品'
    },
    {
      title: '今日订单',
      value: stats.todayOrders,
      icon: markRaw(Tickets),
      color: '#ff9f43',
      subtitle: '今日新增交易'
    },
    {
      title: '待审核商品',
      value: stats.pendingAudit,
      icon: markRaw(Warning),
      color: '#8e67e8',
      subtitle: '需要及时处理'
    }
  ]
}

function disposeCharts() {
  while (chartInstances.length) {
    const chart = chartInstances.pop()
    chart.dispose()
  }
}

function createChart(refValue, option) {
  const chart = echarts.init(refValue)
  chart.setOption(option)
  chartInstances.push(chart)
}

function renderCharts() {
  if (!dashboard.value) {
    return
  }

  disposeCharts()

  const stats = dashboard.value
  const colors = ['#2f7cf6', '#35c46f', '#ff9f43', '#8e67e8', '#48c6ef', '#f56c6c']

  createChart(orderTrendRef.value, {
    color: ['#2f7cf6'],
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 34,
      right: 24,
      bottom: 32,
      left: 44
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.orderTrend.map((item) => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        areaStyle: {
          color: 'rgba(47, 124, 246, 0.12)'
        },
        data: stats.orderTrend.map((item) => item.count)
      }
    ]
  })

  createChart(categoryRef.value, {
    color: colors,
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'center'
    },
    series: [
      {
        name: '分类占比',
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['38%', '52%'],
        label: {
          formatter: '{b}'
        },
        data: stats.categoryStats
      }
    ]
  })

  createChart(collegeRef.value, {
    color: ['#2f7cf6'],
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 34,
      right: 24,
      bottom: 70,
      left: 44
    },
    xAxis: {
      type: 'category',
      data: stats.collegeStats.map((item) => item.name),
      axisLabel: {
        interval: 0,
        rotate: 28
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '发布数量',
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        },
        data: stats.collegeStats.map((item) => item.value)
      }
    ]
  })

  createChart(statusRef.value, {
    color: colors,
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'center'
    },
    series: [
      {
        name: '商品状态',
        type: 'pie',
        radius: ['46%', '68%'],
        center: ['38%', '52%'],
        label: {
          formatter: '{b}'
        },
        data: stats.goodsStatusStats
      }
    ]
  })
}

function resizeCharts() {
  chartInstances.forEach((chart) => {
    chart.resize()
  })
}

async function loadDashboard() {
  loading.value = true

  try {
    const res = await getDashboardStats()
    const stats = res.data
    dashboard.value = stats
    setCards(stats)

    await nextTick()
    renderCharts()
  } catch (error) {
    ElMessage.error(error.message || '数据看板加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  disposeCharts()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 480px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
  gap: 16px;
}

.chart-card {
  min-width: 0;
  padding: 18px 18px 12px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(15, 35, 65, 0.06);
}

.chart-card-wide {
  min-height: 310px;
}

.chart-title {
  height: 24px;
  color: #17233d;
  font-size: 15px;
  font-weight: 600;
}

.chart-box {
  width: 100%;
  height: 270px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
