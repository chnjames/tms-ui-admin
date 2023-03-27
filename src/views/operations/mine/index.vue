<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd"
                        type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['operations:project:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['warehouse:material:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-tabs v-model="taskType" @tab-click="handleTask">
      <el-tab-pane v-for="item in taskTypeList" :key="item.name" :label="item.label" :name="item.name" />
    </el-tabs>
    <!-- 列表 -->
    <el-table class="mine-table" v-loading="loading" :data="list" :show-header="false" @row-click="handleRow">
      <!--选择-->
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="项目名称" prop="name" show-overflow-tooltip>
        <template v-slot="scope">
          <div class="project-name">YOUITMS系统开发</div>
          <span>那是一种内在他们到达不了，也无法触那是一种内在他们到达不了，也无法</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="time" width="100" fixed="right">
        <template v-slot="scope">
          <span>{{ timeFormat('2020-01-01') }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="taskType === 'finish'" label="操作" align="center" width="100" class-name="small-padding fixed-width" fixed="right">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-delete" @click.stop="handleDelete(scope.row)"
                     v-hasPermi="['operations:project:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="任务类型" prop="type">
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
        <el-form-item label="任务名称" prop="title">
          <el-input type="textarea" :rows="1" v-model="form.title" placeholder="给任务起个名字" />
        </el-form-item>
        <el-form-item label="负责人" prop="header">
          <el-input v-model="form.header" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="内部关注人" prop="header">
          <el-select v-model="form.header" style="width: 100%" filterable multiple placeholder="请选择">
            <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="endTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.endTime" type="date" value-format="yyyy-MM-dd" placeholder="选择结束时间" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input type="textarea" :rows="2" v-model="form.description" placeholder="填写简短说明"/>
        </el-form-item>
        <el-form-item label="上传附件" prop="startTime">
          <drag-file-upload :is-show-tip="false" />
        </el-form-item>
        <el-form-item label="优先级" prop="period">
          <el-select v-model="form.period" placeholder="选择优先级" clearable style="width: 100%">
            <el-option v-for="(item, index) in categoryList" :key="index" :label="item.category" :value="item.category" />
          </el-select>
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
  exportMaterialExcel
} from '@/api/warehouse/material'
import { timeFormat } from '@/utils'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import DragFileUpload from '@/components/DragFileUpload/index.vue'

export default {
  name: "Mine",
  components: {
    DragFileUpload,
    DrawerPlus
  },
  data() {
    return {
      timeFormat,
      // 遮罩层
      loading: false,
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
      // 任务类型Tab
      taskType: 'all',
      // 任务类型Tabs
      taskTypeList: [
        {label: '全部任务', name: 'all'},
        {label: '已完成', name: 'finish'},
        {label: '已逾期', name: 'overdue'}
      ],
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
    // this.getList();
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
    /* getList() {
      this.loading = true;
      // 执行查询
      getMaterialPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    }, */
    /** 切换Tabs */
    handleTask(tab, event) {
      console.log(tab, event);
      // this.getList();
    },
    /** Row行详情 */
    handleRow(row, column, event) {
      console.log(row, column, event);
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
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      // this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isReadonly = false;
      this.open = true;
      this.title = "新建任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isReadonly = true;
      const id = row.id;
      getMaterial({id}).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改任务";
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
            // this.getList();
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
          // this.getList();
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
        // this.getList();
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
/*项目名称*/
.project-name {
  font-size: 14px;
  font-weight: 600;
}
.mine-table {
  :deep(.el-table__row) {
    cursor: pointer;
  }
}
</style>
