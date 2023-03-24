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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['warehouse:material:create']">新增</el-button>
      </el-col>
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
      <el-table-column label="需求数量" align="center" prop="demand" />
      <el-table-column label="需求发起人" align="center">
        <template v-slot="{row}">
          <span>{{row.creator.nickname || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template v-slot="{row}">
          <span class="status" :class="row.statusColor">{{row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="需求发起时间" align="center">
        <template v-slot="{row}">
          <span>{{ parseTime(row.createTime)}}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="物料编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入物料编码" />
        </el-form-item>
        <el-form-item label="物料名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="物料品牌" prop="brand">
          <el-select v-model="form.brand" filterable allow-create default-first-option placeholder="请选择物料品牌"
                     style="width: 100%">
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
          </el-select>
        </el-form-item>
        <el-form-item label="物料类别" prop="category">
          <el-select v-model="form.category" :disabled="isReadonly" filterable allow-create default-first-option placeholder="请选择物料类别"
                     style="width: 100%">
            <el-option v-for="(item, index) in categoryList" :key="index" :label="item.category" :value="item.category" />
          </el-select>
        </el-form-item>
        <el-form-item label="物料规格型号" prop="specs">
          <el-autocomplete style="width: 100%" value-key="specs" v-model="form.specs" :fetch-suggestions="querySearch" placeholder="请输入物料规格型号" :trigger-on-focus="false" @select="handleSelect"></el-autocomplete>
        </el-form-item>
        <el-form-item label="物料库存预警" prop="warnStock">
          <el-input-number style="width: 100%" v-model="form.warnStock" controls-position="right" :min="0"></el-input-number>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </drawer-plus>
  </div>
</template>

<script>
import {
  getBrandList,
  getCategoryList,
  getSpecList,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterial,
  getMaterialPage,
  exportMaterialExcel,
  getDemandPage
} from '@/api/warehouse/material'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: "MaterialDemand",
  components: {
    DrawerPlus
  },
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
      // 规格型号列表
      specList: [],
      // 物料需求状态列表
      statusList: getDictDatas(DICT_TYPE.WAREHOUSE_MATERIAL_DEMAND_STATUS),
      // 是否只读
      isReadonly: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        brand: null,
        category: null
      },
      // 表单参数
      form: {
        id: null,
        name: null,
        code: null,
        brand: null,
        category: null,
        specs: null,
        warnStock: 0
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "物料名称不能为空", trigger: "blur" }],
        code: [{ required: true, message: "物料编码不能为空", trigger: "blur" }],
        brand: [{ required: true, message: "物料品牌不能为空", trigger: "blur" }],
        category: [{ required: true, message: "物料类别不能为空", trigger: "blur" }],
        specs: [{ required: true, message: "物料规格型号不能为空", trigger: "blur" }],
        warnStock: [{ required: true, message: "物料库存预警不能为空", trigger: "blur", type: "number" }],
      }
    };
  },
  created() {
    this.getList();
    this.getBrandList();
    this.getCategoryList();
    this.getSpecList();
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
    /** 规格型号列表 */
    getSpecList() {
      getSpecList().then(response => {
        this.specList = response.data;
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
    querySearch(queryString, cb) {
      const specs = this.specList;
      const results = queryString ? specs.filter(this.createFilter(queryString)) : specs;
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.specs.indexOf(queryString) === 0);
      };
    },
    handleSelect(item) {
      console.log(item);
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        code: undefined,
        brand: undefined,
        category: undefined,
        specs: undefined,
        warnStock: 0
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isReadonly = false;
      this.open = true;
      this.title = "添加物料";
    },
    /** 创建采购单按钮操作 */
    handleCreatePurchase() {
      const arr = this.$refs.materialDemandRef.selection;
      console.log(arr);
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        // 修改的提交
        if (this.form.id != null) {
          updateMaterial(this.form).then(response => {
            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.getList();
            this.getBrandList();
            this.getCategoryList();
            this.getSpecList();
          });
          return;
        }
        // 添加的提交
        createMaterial(this.form).then(response => {
          this.$modal.msgSuccess("新增成功");
          this.open = false;
          this.getList();
          this.getBrandList();
          this.getCategoryList();
          this.getSpecList();
        });
      });
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
