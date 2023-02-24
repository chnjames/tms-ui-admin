<template>
  <div class="overview-container">
    <div class="search">
      <el-row type="flex" justify="end">
        <el-col :xs="12" :sm="12" :md="12" :lg="16" :xl="16"><el-input placeholder="请输入" class="search-input" /></el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="4">
          <el-button-group>
            <el-button type="primary" @click="handleSearch">文档搜索</el-button>
            <el-button type="primary" @click="handleSearch">合同搜索</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </div>
    <el-card shadow="never">
      <!-- 搜索工作栏 -->
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item prop="status">
          <el-radio-group v-model="queryParams.status">
            <el-radio-button :label="1">全部</el-radio-button>
            <el-radio-button :label="2">进行中</el-radio-button>
            <el-radio-button :label="3">已完成</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="createTime">
          <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd"
                          type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item prop="type">
          <el-select v-model="queryParams.type" placeholder="选择类型" clearable @clear="bindBrandClear">
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
          </el-select>
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-if="queryParams.type === ''" v-model="queryParams.name" placeholder="请输入项目名称" clearable @keyup.enter.native="handleQuery"/>
          <el-select v-if="queryParams.type === 2" v-model="queryParams.name" placeholder="选择责任人" clearable>
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
          </el-select>
          <el-select v-if="queryParams.type === 3" v-model="queryParams.name" placeholder="选择项目类型" clearable>
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 操作工具栏 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                     v-hasPermi="['operations:overview:create']">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                     v-hasPermi="['warehouse:material:export']">导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="list">
        <el-table-column label="项目图标" align="center" prop="code">
          <template v-slot="scope">
            <el-image :src="scope.row.icon" :preview-src-list="[scope.row.icon]" fit="cover" style="width: 50px; height: 50px"></el-image>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="name" show-overflow-tooltip>
          <template v-slot="scope">
            <div class="project-name">YOUITMS系统开发</div>
            <span>那是一种内在他们到达不了，也无法触那是一种内在他们到达不了，也无法</span>
          </template>
        </el-table-column>
        <el-table-column label="负责人" align="center" prop="head" />
        <el-table-column label="项目类型" align="center" prop="type" />
        <el-table-column label="开始时间" align="center" prop="startTime">
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endTime">
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目进度" align="center" prop="progress">
          <template v-slot="scope">
            <el-progress :percentage="scope.row.progress"></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template v-slot="scope">
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(scope.row)"
                       v-hasPermi="['warehouse:material:delete']">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['operations:overview:delete']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                  @pagination="getList"/>
    </el-card>

    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width: 100%" placeholder="请选择">
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand"/>
          </el-select>
        </el-form-item>
        <!--设备维保类型-->
        <el-form-item label="设备名称" prop="name">
          <el-select v-model="form.name" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" prop="code">
          <div>E29349123435</div>
        </el-form-item>
        <!--项目管理类型-->
        <el-form-item label="项目类型" prop="code">
          <div>普通型(子任务设置无先后顺序)</div>
        </el-form-item>
        <!--生产管理类型-->
        <el-form-item label="项目类型" prop="code">
          <div>流程型(子任务顺序执行)</div>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="给目标起个名字" />
        </el-form-item>
        <el-form-item label="负责人" prop="header">
          <el-input v-model="form.header" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="内部关注人" prop="header">
          <el-select v-model="form.header" style="width: 100%" filterable multiple placeholder="请选择">
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.startTime" type="date" value-format="yyyy-MM-dd" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="任务周期" prop="period">
          <el-select v-model="form.period" placeholder="选择任务周期" clearable style="width: 100%">
            <el-option v-for="(item, index) in categoryList" :key="index" :label="item.category" :value="item.category" />
          </el-select>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.endTime" type="date" value-format="yyyy-MM-dd" placeholder="选择结束时间" />
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
  exportMaterialExcel
} from '@/api/warehouse/material'
import DrawerPlus from '@/components/DrawerPlus/index.vue'

export default {
  name: "Overview",
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
      // 是否只读
      isReadonly: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        status: 1,
        name: null,
        brand: null,
        type: ''
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
      getMaterialPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 清除品牌 */
    bindBrandClear() {
      this.queryParams.brand = null
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
    /** 文档/合同搜索 */
    handleSearch() {
      this.$router.push({
        path: "/operations/search"
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isReadonly = false;
      this.open = true;
      this.title = "新建项目";
    },
    /** 详情按钮操作 */
    handleDetail(row) {
      console.log(row)
      this.reset();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isReadonly = true;
      const id = row.id;
      getMaterial({id}).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改项目";
      });
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal.confirm('是否确认删除物料基础数据编号为"' + id + '"的数据项?').then(function() {
        return deleteMaterial({id});
      }).then(() => {
        this.getList();
        this.getBrandList();
        this.getCategoryList();
        this.getSpecList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
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
:deep(.el-form-item--small .el-form-item__content) {
  line-height: normal;
}
.search {
  background-color: #FFFFFF;
  padding: 20px;
  margin-bottom: 20px;
  &-input {
    width: 100%;
  }
}
/*项目名称*/
.project-name {
  font-size: 14px;
  font-weight: 600;
}
</style>
