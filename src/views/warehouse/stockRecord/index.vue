<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item prop="executorId">
        <el-select v-model="queryParams.executorId" placeholder="执行人" clearable @change="handleQuery">
          <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname" :value="parseInt(item.id)"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="type">
        <el-select v-model="queryParams.type" placeholder="出入库" clearable @change="handleQuery">
          <el-option v-for="item in libraryOptions" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleQuery"
          :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称/编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="物料编号" align="center" prop="materialCode"/>
      <el-table-column label="物料名称" align="center" prop="materialName"/>
      <el-table-column label="规格型号" align="center" prop="materialSpecs"/>
      <el-table-column label="品牌" align="center" prop="materialBrand"/>
      <el-table-column label="物料类别" align="center" prop="materialCategory"/>
      <el-table-column label="所在库区" align="center" prop="storeArea"/>
      <el-table-column label="所在库位" align="center" prop="storeAreaLocation"/>
      <el-table-column label="关联项目" align="center" prop="projectName"/>
      <el-table-column label="需求发起人" align="center" prop="taskCreatorName" width="100"/>
      <el-table-column label="需求发起时间" align="center" prop="taskCreateTime" width="180" />
      <el-table-column label="操作" align="center" prop="typeDesc"/>
      <el-table-column label="数量" align="center" prop="quantity"/>
      <el-table-column label="执行人" align="center" prop="executorName"/>
      <el-table-column label="操作时间" align="center" prop="createTime"/>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import {
  getStockRecordPage
} from '@/api/warehouse/stockRecord'
import { listSimpleUsers } from '@/api/system/user'
import { getStoreAreaPage } from '@/api/config/storeArea'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { getProjectSimpleList } from '@/api/operations/overview'

export default {
  name: 'StockRecord',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 厂区未分组列表
      scatteredStoreArea: [],
      // 项目列表
      projectSimpleList: [],
      // 总条数
      total: 0,
      // 用户列表
      userList: [],
      // 出入库记录列表
      list: [],
      // 出入库选项
      libraryOptions: getDictDatas(DICT_TYPE.WAREHOUSE_STOCK_RECORD_TYPE),
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        executorId: null, // 执行人
        type: null, // 出入库 0出库 1入库
        name: null,
        createTime: null
      }
    }
  },
  async created() {
    const [storeAreaData, userListData, projectListData] = await Promise.all([getStoreAreaPage(), listSimpleUsers(), getProjectSimpleList()])
    this.scatteredStoreArea = storeAreaData.data
    this.userList = userListData.data
    this.projectSimpleList = projectListData.data
    await this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getStockRecordPage(this.queryParams).then(response => {
        const {list, total} = response.data
        list.map(item => {
          item.materialCode = item.material?.code || ''
          item.materialName = item.material?.name || ''
          item.materialSpecs = item.material?.specs || ''
          item.materialBrand = item.material?.brand || ''
          item.materialCategory = item.material?.category || ''
          item.storeArea = this.scatteredStoreArea.find(i => i.id === item.storeAreaId)?.name || ''
          item.typeDesc = this.libraryOptions.find(i => parseInt(i.value) === item.type)?.label || ''
          item.executorName = this.userList.find(i => parseInt(i.id) === item.executorId)?.nickname || ''
          item.projectName = this.projectSimpleList.find(i => i.id === item.projectId)?.name || ''
          item.taskCreatorName = this.userList.find(i => parseInt(i.id) === parseInt(item.taskCreatorId))?.nickname || ''
          item.createTime = parseTime(item.createTime)
          item.taskCreateTime = parseTime(item.taskCreateTime)
        })
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.createTime = null;
      this.handleQuery();
    }
  }
}
</script>
