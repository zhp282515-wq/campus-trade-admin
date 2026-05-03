<template>
  <PageContainer>
    <div class="order-page">
      <div class="page-head">
        <h1 class="page-title">订单管理</h1>
      </div>

      <section class="search-card">
        <el-form :model="queryForm" inline>
          <el-form-item label="关键词">
            <el-input
              v-model.trim="queryForm.keyword"
              clearable
              placeholder="请输入订单号或商品名称"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="queryForm.status" clearable placeholder="全部状态">
              <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="table-card">
        <el-table v-loading="loading" :data="orderList" border stripe>
          <el-table-column prop="id" label="订单ID" width="90" />
          <el-table-column prop="orderNo" label="订单号" min-width="170" />
          <el-table-column prop="goodsName" label="商品名称" min-width="190" show-overflow-tooltip />
          <el-table-column prop="buyerName" label="买家" width="100" />
          <el-table-column prop="sellerName" label="卖家" width="100" />
          <el-table-column label="金额" width="100">
            <template #default="{ row }">￥{{ row.amount }}</template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="170" />
          <el-table-column label="操作" fixed="right" width="220">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="openDetailDialog(row)">
                查看
              </el-button>
              <el-popover placement="bottom" trigger="click" width="140">
                <template #reference>
                  <el-button type="primary" link>改状态</el-button>
                </template>
                <div class="status-actions">
                  <el-button
                    v-for="item in statusOptions"
                    :key="item"
                    size="small"
                    :type="row.status === item ? 'primary' : 'default'"
                    @click="handleStatusChange(row, item)"
                  >
                    {{ item }}
                  </el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>

          <template #empty>
            <el-empty description="暂无订单数据" />
          </template>
        </el-table>

        <div class="pagination-wrap">
          <span class="total-text">共 {{ total }} 条</span>
          <el-pagination
            v-model:current-page="queryForm.page"
            v-model:page-size="queryForm.pageSize"
            :page-sizes="[10, 20, 30]"
            :total="total"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="loadOrderList"
          />
        </div>
      </section>

      <el-dialog v-model="detailVisible" title="订单详情" width="560px">
        <el-descriptions v-if="currentOrder" :column="1" border>
          <el-descriptions-item label="订单ID">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="商品ID">{{ currentOrder.goodsId }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentOrder.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ currentOrder.buyerName }}</el-descriptions-item>
          <el-descriptions-item label="卖家">{{ currentOrder.sellerName }}</el-descriptions-item>
          <el-descriptions-item label="金额">￥{{ currentOrder.amount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentOrder.status)">
              {{ currentOrder.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createdAt }}</el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <el-button type="primary" @click="detailVisible = false">知道了</el-button>
        </template>
      </el-dialog>
    </div>
  </PageContainer>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search, View } from '@element-plus/icons-vue'
import PageContainer from '../../components/PageContainer.vue'
import { getOrderDetail, getOrderList, updateOrderStatus } from '../../api/orders'

const statusOptions = ['待交易', '已完成', '已取消']

const loading = ref(false)
const detailVisible = ref(false)
const orderList = ref([])
const currentOrder = ref(null)
const total = ref(0)

const queryForm = reactive({
  keyword: '',
  status: '',
  page: 1,
  pageSize: 10
})

function getStatusTagType(status) {
  const typeMap = {
    待交易: 'warning',
    已完成: 'success',
    已取消: 'info'
  }

  return typeMap[status] || 'info'
}

// 搜索、筛选和分页由 API 层完成，页面只负责传入查询条件。
async function loadOrderList() {
  loading.value = true

  try {
    const res = await getOrderList({
      keyword: queryForm.keyword,
      status: queryForm.status,
      page: queryForm.page,
      pageSize: queryForm.pageSize
    })

    orderList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '订单列表加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.page = 1
  loadOrderList()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.status = ''
  queryForm.page = 1
  loadOrderList()
}

function handlePageSizeChange() {
  queryForm.page = 1
  loadOrderList()
}

async function openDetailDialog(row) {
  try {
    const res = await getOrderDetail(row.id)
    currentOrder.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '订单详情加载失败')
  }
}

async function handleStatusChange(row, status) {
  if (row.status === status) {
    return
  }

  try {
    await updateOrderStatus(row.id, status)
    ElMessage.success('订单状态已更新')
    loadOrderList()
  } catch (error) {
    ElMessage.error(error.message || '订单状态更新失败')
  }
}

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped>
.order-page {
  min-height: 100%;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  margin-bottom: 0;
}

.search-card,
.table-card {
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(15, 35, 65, 0.06);
}

.search-card {
  padding: 18px 18px 2px;
  margin-bottom: 16px;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 16px;
}

.search-card :deep(.el-input),
.search-card :deep(.el-select) {
  width: 220px;
}

.table-card {
  padding: 16px;
}

.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
}

.total-text {
  color: #6b778c;
  font-size: 13px;
}

.status-actions {
  display: grid;
  gap: 8px;
}

.status-actions .el-button {
  width: 100%;
  margin-left: 0;
}
</style>
