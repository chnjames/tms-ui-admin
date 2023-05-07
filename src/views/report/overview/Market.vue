<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item prop="type">
        <el-select v-model="queryParams.type" placeholder="类型" clearable>
          <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.type" :value="item.type"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入" clearable @keyup.enter.native="handleQuery"/>
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="客户名称" prop="contactId"/>
      <el-table-column label="项目名称" prop="projectId"/>
      <el-table-column label="合同金额" align="center" prop="totalAmount"/>
      <el-table-column label="已收款金额" align="center" prop="receivedAmount"/>
      <el-table-column label="待收金额" prop="timeoutAmount"/>
      <el-table-column label="销售负责人" align="center" prop="blameId" width="180"/>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import { getSalesOverview } from '@/api/report/operations'
export default {
  name: 'Market',
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 类型选项
      menuOptions: [],
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
        name: null
      }
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
      getSalesOverview(this.queryParams).then(response => {
        const {list, total} = response.data
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
    /** 返回按钮操作 */
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>
