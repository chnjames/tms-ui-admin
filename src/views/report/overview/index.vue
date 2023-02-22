<template>
  <div class="app-container">

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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getSearch"></right-toolbar>
    </el-row>

    <!-- tab切换 -->
    <el-tabs v-model="activeName">
      <el-tab-pane label="销售总览" name="market">
        <market />
      </el-tab-pane>
      <el-tab-pane label="采购总览" name="purchase">
        <purchase />
      </el-tab-pane>
      <el-tab-pane label="存货总览" name="stock">
        <stock />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Market from '@/views/report/overview/Market.vue'
import Purchase from '@/views/report/overview/Purchase.vue'
import Stock from '@/views/report/overview/Stock.vue'

export default {
  name: 'Overview',
  components: {
    Stock,
    Purchase,
    Market
  },
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 类型选项
      menuOptions: [],
      // tab选项
      activeName: 'market',
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null
      }
    }
  },
  methods: {
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
