<template>
  <div class="overview-container">
    <div class="search">
      <el-row type="flex" justify="end">
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="4">
          <el-button type="primary" @click="bindBack">返回项目</el-button>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="16" :xl="16">
          <el-input placeholder="请输入" class="search-input" v-model="queryParams.name" />
        </el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="4">
          <el-button-group>
            <el-button type="primary" @click="handleSearch('document')">文档搜索</el-button>
            <el-button type="primary" @click="handleSearch('contract')">合同搜索</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </div>
    <el-card shadow="never">
      <!-- 操作工具栏 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button plain icon="el-icon-download" size="mini"
                     v-hasPermi="['config:device:create']">批量下载</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="list">
        <!--选择-->
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column label="所属项目" align="center" prop="name" />
        <el-table-column label="名称" align="center" prop="name" />
        <el-table-column label="格式" align="center" prop="name" />
        <el-table-column label="大小" align="center" prop="name" />
        <el-table-column label="上传者" align="center" prop="name" />
        <el-table-column label="上传时间" align="center" prop="startTime">
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template v-slot="scope">
            <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownload(scope.row)"
                       v-hasPermi="['warehouse:material:delete']">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                  @pagination="getList"/>
    </el-card>
  </div>
</template>

<script>
import {
  getMaterialPage,
  exportMaterialExcel
} from '@/api/warehouse/material'

import {
  getContractPage,
  getDocumentPage
} from '@/api/operations/overview'

export default {
  name: "Search",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 物料基础数据列表
      list: [],
      // 查询参数
      queryParams: {
        name: null,
        pageNo: 1,
        pageSize: 10
      }
    };
  },
  watch: {
    '$route': {
      handler(val) {
        const {name} = val.query;
        this.queryParams.name = name;
        this.queryParams.pageNo = 1;
        this.getList();
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      if (this.$route.query.type === 'contract') {
        this.getContractList();
      } else if (this.$route.query.type === 'document') {
        this.getDocumentList();
      }
    },
    /** 查询合同列表 */
    getContractList() {
      this.loading = true;
      // 执行查询
      getContractPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 查询文档列表 */
    getDocumentList() {
      this.loading = true;
      // 执行查询
      getDocumentPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 返回项目 */
    bindBack() {
      this.$router.push({
        path: '/operations/overview'
      });
    },
    /** 文档/合同搜索 */
    handleSearch(type) {
      this.$router.push({
        path: '/operations/search',
        query: {
          name: this.queryParams.name,
          type
        }
      });
    },
    /** 详情按钮操作 */
    handleDownload(row) {
      console.log(row)
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      this.$modal.confirm('是否确认导出所有物料基础数据数据项?').then(() => {
        this.exportLoading = true;
        return exportMaterialExcel(params);
      }).then(response => {
        this.$download.excel(response, '物料基础数据.xls');
        this.exportLoading = false;
      }).catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.overview-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  height: 100%;
  width: 100%;
  position: absolute;
}
.search {
  background-color: #FFFFFF;
  padding: 20px;
  margin-bottom: 20px;
  &-input {
    width: 100%;
  }
}
</style>
