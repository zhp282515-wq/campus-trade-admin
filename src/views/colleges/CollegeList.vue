<template>
  <PageContainer>
    <div class="college-page">
      <div class="page-head">
        <h1 class="page-title">学院管理</h1>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增学院</el-button>
      </div>

      <section class="search-card">
        <el-form :model="queryForm" inline>
          <el-form-item label="学院名称">
            <el-input
              v-model.trim="queryForm.keyword"
              clearable
              placeholder="请输入学院名称或代码"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="table-card">
        <el-table v-loading="loading" :data="collegeList" border stripe>
          <el-table-column prop="id" label="学院ID" width="90" />
          <el-table-column prop="name" label="学院名称" min-width="160" />
          <el-table-column prop="code" label="学院代码" width="110" />
          <el-table-column prop="studentCount" label="学生人数" width="110" />
          <el-table-column prop="goodsCount" label="商品数量" width="110" />
          <el-table-column prop="sort" label="排序值" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="170" />
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="{ row }">
              <el-button type="primary" link :icon="Edit" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>

          <template #empty>
            <el-empty description="暂无学院数据" />
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
            @current-change="loadCollegeList"
          />
        </div>
      </section>

      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px">
        <el-form ref="collegeFormRef" :model="collegeForm" :rules="collegeRules" label-width="90px">
          <el-form-item label="学院名称" prop="name">
            <el-input v-model.trim="collegeForm.name" placeholder="请输入学院名称" />
          </el-form-item>
          <el-form-item label="学院代码" prop="code">
            <el-input v-model.trim="collegeForm.code" placeholder="请输入学院代码，如 CS" />
          </el-form-item>
          <el-form-item label="学生人数" prop="studentCount">
            <el-input-number v-model="collegeForm.studentCount" :min="0" :step="1" />
          </el-form-item>
          <el-form-item label="商品数量" prop="goodsCount">
            <el-input-number v-model="collegeForm.goodsCount" :min="0" :step="1" />
          </el-form-item>
          <el-form-item label="排序值" prop="sort">
            <el-input-number v-model="collegeForm.sort" :min="1" :step="1" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            保存
          </el-button>
        </template>
      </el-dialog>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import PageContainer from '../../components/PageContainer.vue'
import {
  createCollege,
  deleteCollege,
  getCollegeList,
  updateCollege
} from '../../api/colleges'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const collegeFormRef = ref()
const collegeList = ref([])
const total = ref(0)

const queryForm = reactive({
  keyword: '',
  page: 1,
  pageSize: 10
})

const collegeForm = reactive({
  id: '',
  name: '',
  code: '',
  studentCount: 0,
  goodsCount: 0,
  sort: 1
})

const collegeRules = {
  name: [{ required: true, message: '请输入学院名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入学院代码', trigger: 'blur' }],
  studentCount: [{ required: true, message: '请输入学生人数', trigger: 'blur' }],
  goodsCount: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  return dialogMode.value === 'create' ? '新增学院' : '编辑学院'
})

function resetCollegeForm() {
  Object.assign(collegeForm, {
    id: '',
    name: '',
    code: '',
    studentCount: 0,
    goodsCount: 0,
    sort: total.value + 1
  })
}

// 搜索和分页交给 API 层，页面只负责收集查询条件。
async function loadCollegeList() {
  loading.value = true

  try {
    const res = await getCollegeList({
      keyword: queryForm.keyword,
      page: queryForm.page,
      pageSize: queryForm.pageSize
    })

    collegeList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '学院列表加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.page = 1
  loadCollegeList()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.page = 1
  loadCollegeList()
}

function handlePageSizeChange() {
  queryForm.page = 1
  loadCollegeList()
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetCollegeForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  dialogMode.value = 'edit'
  Object.assign(collegeForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    studentCount: row.studentCount,
    goodsCount: row.goodsCount,
    sort: row.sort
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!collegeFormRef.value) {
    return
  }

  try {
    await collegeFormRef.value.validate()
    submitLoading.value = true

    const payload = {
      name: collegeForm.name,
      code: collegeForm.code,
      studentCount: collegeForm.studentCount,
      goodsCount: collegeForm.goodsCount,
      sort: collegeForm.sort
    }

    if (dialogMode.value === 'create') {
      await createCollege(payload)
      ElMessage.success('新增学院成功')
    } else {
      await updateCollege(collegeForm.id, payload)
      ElMessage.success('编辑学院成功')
    }

    dialogVisible.value = false
    loadCollegeList()
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除学院“${row.name}”吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCollege(row.id)
    ElMessage.success('删除学院成功')
    loadCollegeList()
  } catch (error) {
    if (error !== 'cancel' && error.message) {
      ElMessage.error(error.message)
    }
  }
}

onMounted(() => {
  loadCollegeList()
})
</script>

<style scoped>
.college-page {
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

.search-card :deep(.el-input) {
  width: 240px;
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
