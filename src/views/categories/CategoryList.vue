<template>
  <PageContainer>
    <div class="category-page">
      <div class="page-head">
        <h1 class="page-title">分类管理</h1>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增分类</el-button>
      </div>

      <section class="table-card">
        <el-table v-loading="loading" :data="categoryList" border stripe>
          <el-table-column prop="id" label="分类ID" width="100" />
          <el-table-column prop="name" label="分类名称" min-width="160" />
          <el-table-column prop="sort" label="排序值" width="110" />
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
            <el-empty description="暂无分类数据" />
          </template>
        </el-table>
      </section>

      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
        <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="90px">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model.trim="categoryForm.name" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item label="排序值" prop="sort">
            <el-input-number v-model="categoryForm.sort" :min="1" :step="1" />
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
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import PageContainer from '../../components/PageContainer.vue'
import {
  createCategory,
  deleteCategory,
  getCategoryList,
  updateCategory
} from '../../api/categories'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const categoryFormRef = ref()
const categoryList = ref([])

const categoryForm = reactive({
  id: '',
  name: '',
  sort: 1
})

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  return dialogMode.value === 'create' ? '新增分类' : '编辑分类'
})

function resetCategoryForm() {
  Object.assign(categoryForm, {
    id: '',
    name: '',
    sort: categoryList.value.length + 1
  })
}

async function loadCategoryList() {
  loading.value = true

  try {
    const res = await getCategoryList()
    categoryList.value = [...res.data].sort((a, b) => a.sort - b.sort)
  } catch (error) {
    ElMessage.error(error.message || '分类列表加载失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetCategoryForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  dialogMode.value = 'edit'
  Object.assign(categoryForm, {
    id: row.id,
    name: row.name,
    sort: row.sort
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!categoryFormRef.value) {
    return
  }

  try {
    await categoryFormRef.value.validate()
    submitLoading.value = true

    const payload = {
      name: categoryForm.name,
      sort: categoryForm.sort
    }

    if (dialogMode.value === 'create') {
      await createCategory(payload)
      ElMessage.success('新增分类成功')
    } else {
      await updateCategory(categoryForm.id, payload)
      ElMessage.success('编辑分类成功')
    }

    dialogVisible.value = false
    loadCategoryList()
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
    await ElMessageBox.confirm(`确定删除分类“${row.name}”吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCategory(row.id)
    ElMessage.success('删除分类成功')
    loadCategoryList()
  } catch (error) {
    if (error !== 'cancel' && error.message) {
      ElMessage.error(error.message)
    }
  }
}

onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.category-page {
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

.table-card {
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(15, 35, 65, 0.06);
}
</style>
