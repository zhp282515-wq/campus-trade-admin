<template>
  <PageContainer>
    <div class="goods-page">
      <div class="page-head">
        <h1 class="page-title">商品管理</h1>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增商品</el-button>
      </div>

      <section class="search-card">
        <el-form :model="queryForm" inline>
          <el-form-item label="商品名称/ID">
            <el-input
              v-model.trim="queryForm.keyword"
              clearable
              placeholder="请输入商品名称或商品ID"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="queryForm.categoryId" clearable placeholder="全部分类">
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
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
        <el-table v-loading="loading" :data="goodsList" border stripe>
          <el-table-column prop="id" label="商品ID" width="90" />
          <el-table-column prop="name" label="商品名称" min-width="190" show-overflow-tooltip />
          <el-table-column prop="categoryName" label="分类" width="110" />
          <el-table-column label="价格" width="100">
            <template #default="{ row }">￥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="sellerName" label="卖家" width="100" />
          <el-table-column prop="college" label="学院" min-width="130" show-overflow-tooltip />
          <el-table-column label="状态" width="130">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="views" label="浏览量" width="90" />
          <el-table-column prop="createdAt" label="发布时间" width="170" />
          <el-table-column label="操作" fixed="right" width="290">
            <template #default="{ row }">
              <el-button type="primary" link :icon="Edit" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-popover placement="bottom" trigger="click" width="160">
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
              <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>

          <template #empty>
            <el-empty description="暂无商品数据" />
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
            @current-change="loadGoodsList"
          />
        </div>
      </section>

      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px">
        <el-form ref="goodsFormRef" :model="goodsForm" :rules="goodsRules" label-width="90px">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model.trim="goodsForm.name" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="分类" prop="categoryId">
            <el-select v-model="goodsForm.categoryId" placeholder="请选择分类">
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number v-model="goodsForm.price" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="卖家" prop="sellerName">
            <el-input v-model.trim="goodsForm.sellerName" placeholder="请输入卖家姓名" />
          </el-form-item>
          <el-form-item label="学院" prop="college">
            <el-select v-model="goodsForm.college" filterable placeholder="请选择学院">
              <el-option
                v-for="item in collegeOptions"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="goodsForm.status" placeholder="请选择状态">
              <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model.trim="goodsForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品描述"
            />
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
import { getCategoryList } from '../../api/categories'
import { getCollegeList } from '../../api/colleges'
import {
  createGoods,
  deleteGoods,
  getGoodsList,
  updateGoods,
  updateGoodsStatus
} from '../../api/goods'

const statusOptions = ['待审核', '在售', '已售', '已下架', '审核驳回']
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const goodsFormRef = ref()
const goodsList = ref([])
const categoryOptions = ref([])
const collegeOptions = ref([])
const total = ref(0)

const queryForm = reactive({
  keyword: '',
  categoryId: '',
  status: '',
  page: 1,
  pageSize: 10
})

const goodsForm = reactive({
  id: '',
  name: '',
  categoryId: '',
  price: 0,
  sellerId: '',
  sellerName: '',
  college: '',
  status: '待审核',
  views: 0,
  description: ''
})

const goodsRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  sellerName: [{ required: true, message: '请输入卖家姓名', trigger: 'blur' }],
  college: [{ required: true, message: '请选择学院', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  return dialogMode.value === 'create' ? '新增商品' : '编辑商品'
})

function getStatusTagType(status) {
  const typeMap = {
    待审核: 'warning',
    在售: 'success',
    已售: 'info',
    已下架: 'danger',
    审核驳回: 'danger'
  }

  return typeMap[status] || 'info'
}

function getCategoryName(categoryId) {
  const category = categoryOptions.value.find((item) => item.id === Number(categoryId))
  return category ? category.name : ''
}

function resetGoodsForm() {
  Object.assign(goodsForm, {
    id: '',
    name: '',
    categoryId: '',
    price: 0,
    sellerId: '',
    sellerName: '',
    college: '',
    status: '待审核',
    views: 0,
    description: ''
  })
}

// 查询、筛选和分页都交给 API 层处理，页面只负责收集参数和渲染结果。
async function loadGoodsList() {
  loading.value = true

  try {
    const res = await getGoodsList({
      keyword: queryForm.keyword,
      categoryId: queryForm.categoryId,
      status: queryForm.status,
      page: queryForm.page,
      pageSize: queryForm.pageSize
    })

    goodsList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '商品列表加载失败')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await getCategoryList()
    categoryOptions.value = res.data
  } catch (error) {
    ElMessage.error(error.message || '分类数据加载失败')
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
  loadGoodsList()
}

function handleReset() {
  queryForm.keyword = ''
  queryForm.categoryId = ''
  queryForm.status = ''
  queryForm.page = 1
  loadGoodsList()
}

function handlePageSizeChange() {
  queryForm.page = 1
  loadGoodsList()
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetGoodsForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  dialogMode.value = 'edit'
  Object.assign(goodsForm, {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    price: row.price,
    sellerId: row.sellerId,
    sellerName: row.sellerName,
    college: row.college,
    status: row.status,
    views: row.views,
    description: row.description
  })
  dialogVisible.value = true
}

function buildGoodsPayload() {
  return {
    name: goodsForm.name,
    categoryId: goodsForm.categoryId,
    categoryName: getCategoryName(goodsForm.categoryId),
    price: goodsForm.price,
    sellerId: goodsForm.sellerId || 0,
    sellerName: goodsForm.sellerName,
    college: goodsForm.college,
    status: goodsForm.status,
    views: goodsForm.views || 0,
    description: goodsForm.description
  }
}

async function handleSubmit() {
  if (!goodsFormRef.value) {
    return
  }

  try {
    await goodsFormRef.value.validate()
    submitLoading.value = true

    if (dialogMode.value === 'create') {
      await createGoods(buildGoodsPayload())
      ElMessage.success('新增商品成功')
    } else {
      await updateGoods(goodsForm.id, buildGoodsPayload())
      ElMessage.success('编辑商品成功')
    }

    dialogVisible.value = false
    loadGoodsList()
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
    await ElMessageBox.confirm(`确定删除商品“${row.name}”吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteGoods(row.id)
    ElMessage.success('删除商品成功')
    loadGoodsList()
  } catch (error) {
    if (error !== 'cancel' && error.message) {
      ElMessage.error(error.message)
    }
  }
}

async function handleStatusChange(row, status) {
  if (row.status === status) {
    return
  }

  try {
    await updateGoodsStatus(row.id, status)
    ElMessage.success('商品状态已更新')
    loadGoodsList()
  } catch (error) {
    ElMessage.error(error.message || '状态更新失败')
  }
}

onMounted(() => {
  loadCategories()
  loadColleges()
  loadGoodsList()
})
</script>

<style scoped>
.goods-page {
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
  width: 200px;
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
