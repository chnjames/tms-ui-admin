<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item>
        <el-date-picker
          v-model="queryParams.buyingTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleQuery"
          :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.type" placeholder="类型">
          <el-option v-for="item in menuOptions" :key="item.type" :label="item.name" :value="item.type"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-if="queryParams.type === 1" v-model="queryParams.materialCode" placeholder="请输入" clearable @keyup.enter.native="handleQuery"/>
        <el-input v-if="queryParams.type === 2" v-model="queryParams.materialName" placeholder="请输入" clearable @keyup.enter.native="handleQuery"/>
        <el-input v-if="queryParams.type === 3" v-model="queryParams.materialCategory" placeholder="请输入" clearable @keyup.enter.native="handleQuery"/>
        <el-input v-if="queryParams.type === 4" v-model="queryParams.supplier" placeholder="请输入" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button plain size="mini" @click="handleBack">返回</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="handleQuery"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="物料编号" prop="materialCode"/>
      <el-table-column label="物料类型" prop="materialCategory"/>
      <el-table-column label="物料名称" prop="materialName"/>
      <el-table-column label="供应商" prop="supplierName"/>
      <el-table-column label="历史平均单价" prop="avgDesc"/>
      <el-table-column label="采购单价" prop="priceDesc"/>
      <el-table-column label="采购数量" prop="count"/>
      <el-table-column label="金额" align="center" prop="amountDesc"/>
      <el-table-column label="需求发起人" align="center" prop="demanderName"/>
      <el-table-column label="采购负责人" prop="blameName"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-files" @click="handleHistory(scope.row)">历史价格</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!--历史价格-->
    <el-dialog title="采购记录" :visible.sync="purchaseVisible" width="1000px" append-to-body>
      <el-table v-loading="purchaseLoading" :data="historyList" style="width: 100%">
        <el-table-column label="物料编号" prop="materialCode"/>
        <el-table-column label="物料类型" prop="materialCategory"/>
        <el-table-column label="物料名称" prop="materialName"/>
        <el-table-column label="供应商" prop="supplierName"/>
        <el-table-column label="历史采购单价" prop="avgDesc"/>
        <el-table-column label="采购数量" prop="count"/>
        <el-table-column label="金额" align="center" prop="amountDesc"/>
        <el-table-column label="采购负责人" align="center" prop="blameName"/>
        <el-table-column label="采购发起时间" prop="buyingTime"/>
      </el-table>
      <!-- 分页组件 -->
      <pagination v-show="historyTotal > 0" :total="historyTotal" :page.sync="historyQueryParams.pageNo" :limit.sync="historyQueryParams.pageSize"
                  @pagination="getHistoryList"/>
    </el-dialog>
  </div>
</template>

<script>
import { getMaterialPurchasePage } from '@/api/report/operations'
import { getSupplierSimpleList } from '@/api/config/supplier'
import { listSimpleUsers } from '@/api/system/user'
import { formatMoney } from '@/utils'
export default {
  name: 'Purchase',
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 类型选项
      menuOptions: [{
        type: 1,
        name: '物料编码'
      }, {
        type: 2,
        name: '物料名称'
      }, {
        type: 3,
        name: '物料类型'
      }, {
        type: 4,
        name: '供应商'
      }],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 销售列表
      list: [],
      // 供应商列表
      supplierList: [],
      // 用户列表
      userList: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        buyingTime: null, // 采购时间
        materialCode: null, // 物料编码
        materialName: null, // 物料名称
        materialCategory: null, // 物料类型
        supplier: null, // 供应商
        type: 1 // 查询类型
      },
      // 历史价格
      historyQueryParams: {
        pageNo: 1,
        pageSize: 10,
        materialCode: null // 物料编码
      },
      // 历史价格列表
      historyList: [],
      // 历史价格总条数
      historyTotal: 0,
      // 采购记录
      purchaseVisible: false,
      // 采购记录遮罩层
      purchaseLoading: false
    }
  },
  async mounted() {
    // 获取供应商精简信息列表
    const [supplierListData, userListData] = await Promise.all([getSupplierSimpleList(), listSimpleUsers()])
    this.supplierList = supplierListData.data
    this.userList = userListData.data
    await this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getMaterialPurchasePage(this.queryParams).then(response => {
        const {list, total} = response.data
        list.map(item => {
          item.materialCode = item.material?.code || ''
          item.materialCategory = item.material?.category || ''
          item.materialName = item.material?.name || ''
          item.supplierName = this.supplierList.find(i => i.id === item.supplierId)?.name || ''
          item.avgDesc = formatMoney(item.avg / 100 ?? 0)
          item.priceDesc = formatMoney(item.price / 100 ?? 0)
          item.amount = item.price * item.count
          item.amountDesc = formatMoney(item.amount / 100 ?? 0)
          item.blameName = this.userList.find(i => i.id === item.blameId)?.nickname || ''
          item.demanderName = this.userList.find(i => i.id === item.demanderId)?.nickname || ''
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
    /** 历史价格 */
    handleHistory(row) {
      this.purchaseVisible = true
      this.historyQueryParams.materialCode = row.material.code
      this.getHistoryList()
    },
    /** 查询列表 */
    getHistoryList() {
      this.purchaseLoading = true
      // 执行查询
      getMaterialPurchasePage(this.historyQueryParams).then(response => {
        const {list, total} = response.data
        list.map(item => {
          item.materialCode = item.material?.code || ''
          item.materialCategory = item.material?.category || ''
          item.materialName = item.material?.name || ''
          item.supplierName = this.supplierList.find(i => i.id === item.supplierId)?.name || ''
          item.avgDesc = formatMoney(item.avg / 100 ?? 0)
          item.priceDesc = formatMoney(item.price / 100 ?? 0)
          item.amount = item.price * item.count
          item.amountDesc = formatMoney(item.amount / 100 ?? 0)
          item.blameName = this.userList.find(i => i.id === item.blameId)?.nickname || ''
          item.buyingTime = this.parseTime(item.buyingTime, '{y}-{m}-{d}')
        })
        this.historyList = list
        this.historyTotal = total
        this.purchaseLoading = false
      })
    },
    /** 返回按钮操作 */
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>
