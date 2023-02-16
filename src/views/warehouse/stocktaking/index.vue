<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-if="refreshTable" v-loading="loading" :data="list" row-key="id" :default-expand-all="isExpandAll"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="名称" prop="name"/>
      <el-table-column label="储位数量" align="center" prop="quantity"/>
      <el-table-column label="储位规格(排*层*列)" align="center" prop="specs"/>
      <el-table-column label="最新开始时间" align="center" prop="lastStocktakingBeginTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.lastStocktakingBeginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最新完成时间" align="center" prop="lastStocktakingEndTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.lastStocktakingEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-files" v-hasPermi="['config:store-area:update']">盘点</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  getStocktakingPage
} from '@/api/warehouse/stocktaking'

export default {
  name: 'Stocktaking',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 仓库盘点列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getStocktakingPage(this.queryParams).then(response => {
        const { data } = response
        data.map(item => {
          const [row, layer, column] = item.specs?.split('-') || []
          item.quantity = row * layer * column
        })
        this.list = this.handleTree(data)
        this.loading = false
      })
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
