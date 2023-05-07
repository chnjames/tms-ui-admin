<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item>
        <el-date-picker v-model="queryParams.buyingTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.type" placeholder="类型" clearable>
          <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.type" :value="item.type"/>
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getSearch"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="物料编号">
        <template v-slot="{ row }">
          <span>{{ row.material.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料类型">
        <template v-slot="{ row }">
          <span>{{ row.material.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料名称">
        <template v-slot="{ row }">
          <span>{{ row.material.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="供应商" prop="supplierId"/>
      <el-table-column label="历史平均单价" prop="avg"/>
      <el-table-column label="采购单价" prop="price"/>
      <el-table-column label="采购数量" prop="count"/>
      <el-table-column label="金额" align="center" prop="contactName"/>
      <el-table-column label="需求发起人" align="center" prop="demanderId"/>
      <el-table-column label="采购负责人" prop="blameId"/>
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
      <el-table v-loading="purchaseLoading" :data="list" style="width: 100%">
        <el-table-column label="物料编号" prop="name"/>
        <el-table-column label="物料类型" prop="name"/>
        <el-table-column label="物料名称" prop="name"/>
        <el-table-column label="供应商" prop="name"/>
        <el-table-column label="历史采购单价" prop="name"/>
        <el-table-column label="采购数量" prop="address"/>
        <el-table-column label="金额" align="center" prop="contactName"/>
        <el-table-column label="采购负责人" align="center" prop="contactMobile"/>
        <el-table-column label="采购发起时间" prop="email"/>
      </el-table>
      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                  @pagination="getList"/>
    </el-dialog>
  </div>
</template>

<script>
import { getMaterialPurchasePage } from '@/api/report/operations'
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
      // 采购记录
      purchaseVisible: false,
      // 采购记录遮罩层
      purchaseLoading: false
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getMaterialPurchasePage(this.queryParams).then(response => {
        const {list, total} = response.data
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 历史价格 */
    handleHistory(row) {
      console.log(row)
      this.purchaseVisible = true
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
    },
    getSearch() {},
    /** 返回按钮操作 */
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>
