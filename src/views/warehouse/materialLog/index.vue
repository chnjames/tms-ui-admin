<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item prop="executorId">
        <el-select v-model="queryParams.executorId" placeholder="执行人" clearable>
          <el-option v-for="(item, index) in executorOptions" :key="index" :label="item.type" :value="item.type"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="operate">
        <el-select v-model="queryParams.operate" placeholder="出入库" clearable>
          <el-option v-for="(item, index) in libraryOptions" :key="index" :label="item.type" :value="item.type"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称/编号" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                   :loading="exportLoading"
                   v-hasPermi="['warehouse:material-log:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="物料编号" align="center" prop="materialId"/>
      <el-table-column label="物料名称" align="center" prop="materialName"/>
      <el-table-column label="规格型号" align="center" prop="id"/>
      <el-table-column label="品牌" align="center" prop="storeAreaId"/>
      <el-table-column label="物料类别" align="center" prop="storeAreaLocation"/>
      <el-table-column label="所在库区" align="center" prop="taskId"/>
      <el-table-column label="所在库位" align="center" prop="operate"/>
      <el-table-column label="关联任务" align="center" prop="count"/>
      <el-table-column label="需求发起人" align="center" prop="executorId" width="100"/>
      <el-table-column label="需求发起时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" prop="executorId"/>
      <el-table-column label="数量" align="center" prop="executorId"/>
      <el-table-column label="执行人" align="center" prop="executorId"/>
      <el-table-column label="操作时间" align="center" prop="executorId"/>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="title" :visible.sync="open" width="500px" v-dialogDrag append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="物料ID" prop="materialId">
          <el-input v-model="form.materialId" placeholder="请输入物料ID"/>
        </el-form-item>
        <el-form-item label="库区ID" prop="storeAreaId">
          <el-input v-model="form.storeAreaId" placeholder="请输入库区ID"/>
        </el-form-item>
        <el-form-item label="库位，排-层-列，取值1-99" prop="storeAreaLocation">
          <el-input v-model="form.storeAreaLocation" placeholder="请输入库位，排-层-列，取值1-99"/>
        </el-form-item>
        <el-form-item label="出库关联任务ID" prop="taskId">
          <el-input v-model="form.taskId" placeholder="请输入出库关联任务ID"/>
        </el-form-item>
        <el-form-item label="出入库操作（0出库 1入库）" prop="operate">
          <el-input v-model="form.operate" placeholder="请输入出入库操作（0出库 1入库）"/>
        </el-form-item>
        <el-form-item label="数量" prop="count">
          <el-input v-model="form.count" placeholder="请输入数量"/>
        </el-form-item>
        <el-form-item label="执行人ID" prop="executorId">
          <el-input v-model="form.executorId" placeholder="请输入执行人ID"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  createMaterialLog,
  exportMaterialLogExcel,
  getMaterialLogPage,
  updateMaterialLog
} from '@/api/warehouse/materialLog'

export default {
  name: 'MaterialLog',
  components: {},
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
      // 出入库记录列表
      list: [],
      // 执行人选项
      executorOptions: [],
      // 出入库选项
      libraryOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        materialId: null,
        operate: null,
        executorId: null,
        createTime: []
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        materialId: [{ required: true, message: '物料ID不能为空', trigger: 'blur' }],
        storeAreaId: [{ required: true, message: '库区ID不能为空', trigger: 'blur' }],
        operate: [{ required: true, message: '出入库操作（0出库 1入库）不能为空', trigger: 'blur' }],
        count: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
        executorId: [{ required: true, message: '执行人ID不能为空', trigger: 'blur' }]
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
      getMaterialLogPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        materialId: undefined,
        storeAreaId: undefined,
        storeAreaLocation: undefined,
        taskId: undefined,
        operate: undefined,
        count: undefined,
        executorId: undefined
      }
      this.resetForm('form')
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
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        // 修改的提交
        if (this.form.id != null) {
          updateMaterialLog(this.form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
          return
        }
        // 添加的提交
        createMaterialLog(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = { ...this.queryParams }
      params.pageNo = undefined
      params.pageSize = undefined
      this.$modal.confirm('是否确认导出所有出入库记录数据项?').then(() => {
        this.exportLoading = true
        return exportMaterialLogExcel(params)
      }).then(response => {
        this.$download.excel(response, '出入库记录.xls')
        this.exportLoading = false
      }).catch(() => {
      })
    }
  }
}
</script>
