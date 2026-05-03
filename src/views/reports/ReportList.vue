<template>
  <PageContainer>
    <div class="report-page">
      <div class="page-head">
        <h1 class="page-title">举报审核</h1>
      </div>

      <section class="search-card">
        <el-form :model="queryForm" inline>
          <el-form-item label="处理状态">
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
        <el-table v-loading="loading" :data="reportList" border stripe>
          <el-table-column prop="id" label="举报ID" width="90" />
          <el-table-column prop="goodsName" label="商品名称" min-width="190" show-overflow-tooltip />
          <el-table-column prop="reporterName" label="举报人" width="100" />
          <el-table-column prop="reason" label="举报原因" min-width="240" show-overflow-tooltip />
          <el-table-column label="处理状态" width="110">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="举报时间" width="170" />
          <el-table-column label="操作" fixed="right" width="230">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="openDetailDialog(row)">
                查看
              </el-button>
              <el-button
                type="success"
                link
                :disabled="row.status === '已通过'"
                @click="handleAudit(row, '已通过')"
              >
                通过
              </el-button>
              <el-button
                type="danger"
                link
                :disabled="row.status === '已驳回'"
                @click="handleAudit(row, '已驳回')"
              >
                驳回
              </el-button>
            </template>
          </el-table-column>

          <template #empty>
            <el-empty description="暂无举报数据" />
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
            @current-change="loadReportList"
          />
        </div>
      </section>

      <el-dialog v-model="detailVisible" title="举报详情" width="560px">
        <el-descriptions v-if="currentReport" :column="1" border>
          <el-descriptions-item label="举报ID">{{ currentReport.id }}</el-descriptions-item>
          <el-descriptions-item label="商品ID">{{ currentReport.goodsId }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentReport.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="举报人">{{ currentReport.reporterName }}</el-descriptions-item>
          <el-descriptions-item label="举报原因">{{ currentReport.reason }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTagType(currentReport.status)">
              {{ currentReport.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="举报时间">{{ currentReport.createdAt }}</el-descriptions-item>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, View } from '@element-plus/icons-vue'
import PageContainer from '../../components/PageContainer.vue'
import { getReportDetail, getReportList, updateReportStatus } from '../../api/reports'

const statusOptions = ['待处理', '已通过', '已驳回']

const loading = ref(false)
const detailVisible = ref(false)
const reportList = ref([])
const currentReport = ref(null)
const total = ref(0)

const queryForm = reactive({
  status: '',
  page: 1,
  pageSize: 10
})

function getStatusTagType(status) {
  const typeMap = {
    待处理: 'warning',
    已通过: 'success',
    已驳回: 'danger'
  }

  return typeMap[status] || 'info'
}

async function loadReportList() {
  loading.value = true

  try {
    const res = await getReportList({
      status: queryForm.status,
      page: queryForm.page,
      pageSize: queryForm.pageSize
    })

    reportList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '举报列表加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.page = 1
  loadReportList()
}

function handleReset() {
  queryForm.status = ''
  queryForm.page = 1
  loadReportList()
}

function handlePageSizeChange() {
  queryForm.page = 1
  loadReportList()
}

async function openDetailDialog(row) {
  try {
    const res = await getReportDetail(row.id)
    currentReport.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '举报详情加载失败')
  }
}

async function handleAudit(row, status) {
  if (row.status === status) {
    return
  }

  const actionText = status === '已通过' ? '通过' : '驳回'

  try {
    await ElMessageBox.confirm(`确定${actionText}该举报吗？`, '审核确认', {
      confirmButtonText: actionText,
      cancelButtonText: '取消',
      type: 'warning'
    })

    await updateReportStatus(row.id, status)
    ElMessage.success(`举报已${actionText}`)
    loadReportList()
  } catch (error) {
    if (error !== 'cancel' && error.message) {
      ElMessage.error(error.message)
    }
  }
}

onMounted(() => {
  loadReportList()
})
</script>

<style scoped>
.report-page {
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

.search-card :deep(.el-select) {
  width: 210px;
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
</style>
