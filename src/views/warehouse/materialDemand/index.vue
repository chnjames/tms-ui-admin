<template>
  <div class="app-container">

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="brand">
        <el-select v-model="queryParams.brand" placeholder="选择物料品牌" clearable @clear="bindBrandClear">
          <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
        </el-select>
      </el-form-item>
      <el-form-item prop="category">
        <el-select v-model="queryParams.category" placeholder="选择物料类别" clearable @clear="bindCategoryClear">
          <el-option v-for="(item, index) in categoryList" :key="index" :label="item.category" :value="item.category" />
        </el-select>
      </el-form-item>
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入物料名称/编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleCreatePurchase"
                   v-hasPermi="['warehouse:material:create']">创建采购单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['warehouse:material:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table ref="materialDemandRef" v-loading="loading" :data="list">
      <el-table-column type="selection" :selectable="compSelection" width="55" align="center"/>
      <el-table-column label="物料编号" align="center" prop="materialCode" />
      <el-table-column label="物料名称" align="center" prop="materialName" />
      <el-table-column label="规格型号" align="center" prop="materialSpecs" />
      <el-table-column label="品牌" align="center" prop="materialBrand" />
      <el-table-column label="物料类别" align="center" prop="materialCategory" />
      <el-table-column label="需求数量" align="center" prop="count" />
      <el-table-column label="需求发起人" align="center" prop="demander">
        <template v-slot="{row}">
          <span>{{row.creator.nickname || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="{row}">
          <span class="status" :class="row.statusColor">{{row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="需求发起时间" align="center" prop="createTime">
        <template v-slot="{row}">
          <span>{{ parseTime(row.createTime)}}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <material-table ref="materialTableRef" :title="title" :open="open" :transfer="transfer" @cancel="cancel" @success="submitForm" />
  </div>
</template>

<script>
import { getBrandList, getCategoryList, exportMaterialExcel, getDemandPage } from '@/api/warehouse/material'
import { getMaterialBuyingAvgPrice, createMaterialBuying } from '@/api/warehouse/materialBuying'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import MaterialTable from '@/views/warehouse/components/materialTable.vue'
import store from '@/store'

export default {
  name: "MaterialDemand",
  components: { MaterialTable },
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
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 品牌列表
      brandList: [],
      // 类别列表
      categoryList: [],
      // 物料需求状态列表
      statusList: getDictDatas(DICT_TYPE.WAREHOUSE_MATERIAL_DEMAND_STATUS),
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        brand: null,
        category: null
      },
      // 传递给子组件的参数
      transfer: null
    };
  },
  created() {
    this.getList();
    this.getBrandList();
    this.getCategoryList();
  },
  methods: {
    /** 品牌列表 */
    getBrandList() {
      getBrandList().then(response => {
        this.brandList = response.data;
      });
    },
    /** 类别列表 */
    getCategoryList() {
      getCategoryList().then(response => {
        this.categoryList = response.data;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getDemandPage(this.queryParams).then(response => {
        const { list, total } = response.data;
        const statusLookup = this.statusList.reduce((lookup, status) => {
          lookup[status.value] = {
            label: status.label,
            color: status.colorType
          };
          return lookup;
        }, {});
        list.forEach(item => {
          const {label, color} = statusLookup[item.status];
          item.statusName = label;
          item.statusColor = color;
        });
        this.list = list;
        this.total = total;
        this.loading = false;
      });
    },
    /** 限制list列表多选 */
    compSelection(row) {
      return row.status === 0;
    },
    /** 清除品牌 */
    bindBrandClear() {
      this.queryParams.brand = null
    },
    /** 清除类别 */
    bindCategoryClear() {
      this.queryParams.category = null
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 创建采购单按钮操作 */
    handleCreatePurchase() {
      const arr = this.$refs.materialDemandRef.selection;
      if (arr.length === 0) {
        this.$modal.msgWarning("请选择物料");
        return;
      }
      const demandIds = arr.map(item => item.id).join(",")
      this.getMaterialBuyingAvgPrice(demandIds);
    },
    /** 获得物料采购均价 */
    getMaterialBuyingAvgPrice(demandIds) {
      getMaterialBuyingAvgPrice({ demandIds }).then(response => {
        const { data } = response;
        data.map(item => {
          item.materialCode = item.materialAvg.material.code;
          item.materialName = item.materialAvg.material.name;
          item.materialSpecs = item.materialAvg.material.specs;
          item.materialBrand = item.materialAvg.material.brand;
          item.materialCategory = item.materialAvg.material.category;
          item.demander = item.demander.nickname;
          item.historyPrice = item.materialAvg.avg / 100;
        });
        const userId = store.getters.userId;
        this.transfer = {
          blameId: userId,
          action: 0,
          items: data
        };
        this.open = true;
        this.title = "编辑";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.open = false;
      this.getList();
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
.status {
  &.danger {
    color: #f56c6c;
  }
  &.info {
    color: #909399;
  }
}
</style>
