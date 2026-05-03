<template>
  <PageContainer>
    <div class="user-page">
      <div class="page-head">
        <h1 class="page-title">用户管理</h1>
      </div>

      <section class="search-card">
        <el-form :model="queryForm" inline>
          <el-form-item label="关键词">
            <el-input
              v-model.trim="queryForm.keyword"
              clearable
              placeholder="请输入学号或姓名"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="学院">
            <el-select v-model="queryForm.college" clearable placeholder="全部学院" filterable>
              <el-option
                v-for="item in collegeOptions"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryForm.status" clearable placeholder="全部状态">
              <el-option label="正常" value="正常" />
              <el-option label="禁用" value="禁用" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="table-card">
        <el-table v-loading="loading" :data="userList" border stripe>
          <el-table-column prop="id" label="用户ID" width="90" />
          <el-table-column prop="username" label="学号" min-width="130" />
          <el-table-column prop="nickname" label="姓名" width="110" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="college" label="学院" min-width="140" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="goodsCount" label="发布商品数" width="110" />
          <el-table-column prop="createdAt" label="注册时间" width="170" />
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="openDetailDialog(row)">
                查看
              </el-button>
              <el-button
                :type="row.status === '正常' ? 'danger' : 'success'"
                link
                @click="handleToggleStatus(row)"
              >
                {{ row.status === '正常' ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>

          <template #empty>
            <el-empty description="暂无用户数据" />
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
            @current-change="loadUserList"
          />
        </div>
      </section>

      <el-dialog v-model="detailVisible" title="用户详情" width="520px">
        <el-descriptions v-if="currentUser" :column="1" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentUser.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ currentUser.college }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === '正常' ? 'success' : 'danger'">
              {{ currentUser.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布商品数">
            {{ currentUser.goodsCount }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.createdAt }}</el-descriptions-item>
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
import { getCollegeList } from '../../api/colleges'
import { getUserDetail, getUserList, updateUserStatus } from '../../api/users'

const loading = ref(false)
const detailVisible = ref(false)
const userList = ref([])
const currentUser = ref(null)
const collegeOptions = ref([])
const total = ref(0)

const queryForm = reactive({
  keyword: '',
  college: '',
  status: '',
  page: 1,
  pageSize: 10
})

// 搜索、筛选和分页逻辑都放在 API 层，页面只传查询条件。
async function loadUserList() {
  loading.value = true

  try {
    const res = await getUserList({
      keyword: queryForm.keyword,
      college: queryForm.college,
      status: queryForm.status,
      page: queryForm.page,
      pageSize: queryForm.pageSize
    })

    userList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '用户列表加载失败')
  } finally {
    loading.value = false
  }
}

async function loadColleges() {
  try {
    const res = await getCollegeList({ status: '启用' })
    collegeOptions.value = res.data
  } catch (error) {
    ElMessage.error(error.message || '学院数据加载失败')
  }
}

function handleSearch() {
  queryForm.page = 1
  loadUserList()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.college = ''
  queryForm.status = ''
  queryForm.page = 1
  loadUserList()
}

function handlePageSizeChange() {
  queryForm.page = 1
  loadUserList()
}

async function openDetailDialog(row) {
  try {
    const res = await getUserDetail(row.id)
    currentUser.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '用户详情加载失败')
  }
}

async function handleToggleStatus(row) {
  const nextStatus = row.status === '正常' ? '禁用' : '正常'

  try {
    await updateUserStatus(row.id, nextStatus)
    ElMessage.success(`用户已${nextStatus === '正常' ? '启用' : '禁用'}`)
    loadUserList()
  } catch (error) {
    ElMessage.error(error.message || '用户状态更新失败')
  }
}

onMounted(() => {
  loadColleges()
  loadUserList()
})
</script>

<style scoped>
.user-page {
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
