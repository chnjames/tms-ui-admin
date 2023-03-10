<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form v-show="showSearch" :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item>
        <el-input v-show="showSearch" v-model="queryParams.name" placeholder="请输入名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:factory-area:create']">新增附件</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="el-icon-delete" size="mini" @click="handleAdd"
                   v-hasPermi="['config:device:create']">批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-download" size="mini"
                   v-hasPermi="['config:device:create']">批量下载</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" :width="60" align="center" />
      <el-table-column
        v-for="(item, index) in tableHeader"
        :key="index"
        :prop="item.prop"
        :width="item.width"
        :fixed="item.fixed"
        :label="item.label">
        <template v-slot="{row}">
          <template v-if="item.prop === 'operation'">
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                       v-hasPermi="['config:factory-area:delete']">删除</el-button>
          </template>
          <template v-else-if="item.prop === 'updateTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 上传附件 -->
    <el-dialog custom-class="material" :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item prop="name">
          <file-upload v-model="form.file" :is-show-tip="false" :fileList="form.fileList" drag />
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  createFactoryArea,
  deleteFactoryArea,
  updateFactoryArea
} from '@/api/config/factoryArea'
import { getCustomerPage } from "@/api/config/customer";
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'

export default {
  name: 'DocAppendix',
  components: { FileUpload, DrawerPlus },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 任务详情列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: null,
        pageNo: 1,
        pageSize: 10
      },
      // 基础表头
      tableHeader: [
        { prop: 'name', label: '文件名称' },
        { prop: 'name', label: '格式' },
        { prop: 'name', label: '大小' },
        { prop: 'executorName', label: '上传者' },
        { prop: 'updateTime', label: '上传时间' },
        { prop: 'operation', label: '操作' }
      ],
      // 表单参数
      form: {
        id: undefined
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { max: 30, message: '名称不能超过30个字', trigger: 'blur' }
        ],
        planQuantity: { required: true, type: 'number', message: '计划数量不能为空', trigger: 'blur' },
        hours: { required: true, type: 'number', message: '预计工时不能为空', trigger: 'blur' },
        firstBeginTime: { required: true, type: 'date', message: '首任务开始时间不能为空', trigger: 'change' },
        mode: { required: true, message: '生效方式不能为空', trigger: 'change' },
        beginTime: { required: true, type: 'date', message: '计划开始时间不能为空', trigger: 'change' },
        endTime: { required: true, type: 'date', message: '计划结束时间不能为空', trigger: 'change' },
        taskId: { required: true, message: '选择任务触发不能为空', trigger: 'change' }
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getCustomerPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        executorId: undefined, // 执行人
        hours: undefined, // 预计工时
        internalIds: [],
        externalIds: [],
        mode: undefined,
        beginTime: undefined,
        endTime: undefined,
        taskId: undefined,
        emergency: false,
        outsourceCost: 0
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加'
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        // 修改的提交
        if (this.form.id != null) {
          updateFactoryArea(this.form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
          return
        }
        // 添加的提交
        createFactoryArea(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const name = row.name
      const id = row.id
      this.$modal.confirm('是否确认删除名称为"' + name + '"的数据项?').then(function() {
        return deleteFactoryArea(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.el-upload) {
  width: 100%;
}
:deep(.el-upload-dragger) {
  height: 200px;
  width: 100%;
}
</style>