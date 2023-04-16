<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form v-show="showSearch" :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item prop="type">
        <el-select v-model="queryParams.type" placeholder="模板类型" clearable @clear="handleClear">
          <el-option v-for="item in menuOptions" :key="parseInt(item.value)" :label="item.label"
                     :value="parseInt(item.value)"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.name" placeholder="请输入模板名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:factory-area:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="el-icon-delete" size="mini"
                   v-hasPermi="['config:device:create']">批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="el-icon-download" size="mini"
                   v-hasPermi="['config:device:create']">模板下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-upload2" size="mini"
                   v-hasPermi="['config:device:create']">批量上传</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" ref="multipleTable">
      <!--选择-->
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="模板编号" sortable prop="code"/>
      <el-table-column label="模板名称" sortable prop="name"/>
      <el-table-column label="模板类型" prop="typeDesc"/>
      <el-table-column label="更新时间" sortable align="center" prop="updateTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['config:factory-area:update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['config:factory-area:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="600" append-to-body>
      <el-form class="form" ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择模板类型" clearable style="width: 100%">
            <el-option v-for="item in menuOptions" :key="parseInt(item.value)" :label="item.label"
                       :value="parseInt(item.value)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称"/>
        </el-form-item>
        <el-card shadow="never" v-for="(item, index) in form.extras" :key="index">
          <el-row :gutter="10" type="flex" justify="space-between">
            <el-col :span="23">
              <template v-if="form.type === 2">
                <el-form-item label="设备部位" :prop="'extras.'+ index + '.name'" :rules="extrasRules.name">
                  <el-input v-model="item.name" placeholder="请输入设备部位"/>
                </el-form-item>
                <el-form-item label="部位图片" :prop="'extras.' + index + '.url'" :rules="extrasRules.url">
                  <imageUpload :upload-file-url="uploadFileUrl" v-model="item.url" :limit="1" :is-show-tip="false"/>
                </el-form-item>
                <el-row v-for="(task, idx) in item.tasks" :key="idx" :gutter="10" type="flex" justify="space-between">
                  <el-col :span="23">
                    <el-form-item label="任务名称" :prop="'extras.' + index + '.tasks.' + idx + '.taskName'"
                                  :rules="tasksRules.taskName">
                      <el-input v-model="task.taskName" placeholder="请输入任务名称"/>
                    </el-form-item>
                  </el-col>
                  <i class="inter el-icon-delete" v-if="item.tasks.length > 1" @click="deleteInterItems(task, idx)"></i>
                </el-row>
                <el-button type="primary" icon="el-icon-plus" @click="addInterItems(item, index)" plain
                           style="margin-top: 10px;width: 100%">添加任务项</el-button>
              </template>
              <template v-else>
                <el-form-item :label="`工序/项目${index + 1}`" :prop="'extras.'+ index + '.name'"
                              :rules="extrasRules.name">
                  <el-input v-model="item.name" placeholder="请输入工序/项目名称"/>
                </el-form-item>
                <el-form-item label="执行人" :prop="'extras.'+ index + '.blameId'" :rules="extrasRules.blameId">
                  <el-select v-model="item.blameId" style="width: 100%" placeholder="请选择执行人">
                    <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                               :value="parseInt(item.id)"/>
                  </el-select>
                </el-form-item>
              </template>
            </el-col>
            <i class="outer el-icon-delete" v-if="form.extras.length > 1" @click="deleteOuterItems(item, index)"></i>
          </el-row>
        </el-card>
        <!--添加外层内容-->
        <el-button type="primary" plain icon="el-icon-plus" @click="addOuterItems" style="margin-top: 10px;margin-bottom: 10px;width: 100%">添加</el-button>
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
  getTaskTemplatePage,
  deleteTaskTemplate,
  createTaskTemplate,
  getTaskTemplate,
  updateTaskTemplate
} from '@/api/operations/taskTemplate'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { listSimpleUsers } from '@/api/system/user'

export default {
  name: 'TaskTemplate',
  components: {
    DrawerPlus,
    ImageUpload
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 任务模板类型列表
      menuOptions: getDictDatas(DICT_TYPE.OPERATIONS_TEMPLATE_TYPE),
      // 总条数
      total: 0,
      // 模板列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: null,
        type: null,
        pageNo: 1,
        pageSize: 10
      },
      // 用户列表
      userList: [],
      // 上传图片地址
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/admin-api/operations/template/image/upload",
      // 表单参数
      form: {
        name: undefined, // 模板名称
        type: 0, // 模板类型 默认项目模板类型
        extras: [{
          name: undefined, // 设备部位
          url: undefined, // 图片
          blameId: undefined, // 执行人 --- 生产管理类型
          tasks: [{
            taskName: undefined // 任务名称
          }]
        }]
      },
      // 表单校验
      rules: {
        type: { required: true, message: '模板类型不能为空', trigger: 'change' },
        name: [
          { required: true, message: '模板名称不能为空', trigger: 'blur' },
          { max: 30, message: '模板名称不能超过30个字', trigger: 'blur' }
        ]
      },
      extrasRules: {
        name: [
          { required: true, message: '设备部位不能为空', trigger: 'blur' },
          { max: 30, message: '设备部位不能超过30个字', trigger: 'blur' }
        ],
        url: { required: true, message: '部位图片不能为空', trigger: 'blur' },
        blameId: { required: true, message: '执行人不能为空', trigger: 'change' }
      },
      tasksRules: {
        taskName: [
          { required: true, message: '任务名称不能为空', trigger: 'blur' },
          { max: 30, message: '任务名称不能超过30个字', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getTaskTemplatePage(this.queryParams).then(response => {
        const { list, total } = response.data
        list.map(item => {
          item.typeDesc = this.menuOptions.find(type => parseInt(type.value) === item.type).label
        })
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 清除设备类型 */
    handleClear() {
      this.queryParams.type = null
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        name: undefined,
        type: 0,
        extras: [{
          name: undefined,
          url: undefined,
          blameId: undefined,
          tasks: [{
            taskName: undefined
          }]
        }]
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
      this.title = '创建模板'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id
      getTaskTemplate(id).then(response => {
        const { data } = response
        if (data.type === 2) {
          data.extras.map(item => {
            item.tasks = item.tasks.map(task => {
              return { taskName: task }
            })
          })
        }
        this.form = data
        this.open = true
        this.title = '修改模板'
      })
    },
    /** 添加任务项操作 */
    addInterItems(item) {
      item.tasks.push({
        taskName: undefined
      })
    },
    /** 删除任务项操作 */
    deleteInterItems(task, idx) {
      this.form.extras[idx].tasks.splice(task, 1)
    },
    /** 添加部位&任务项操作 */
    addOuterItems() {
      this.form.extras.push({
        name: undefined,
        url: undefined,
        blameId: undefined,
        tasks: [{
          taskName: undefined
        }]
      })
    },
    /** 删除部位&任务项操作 */
    deleteOuterItems(item, index) {
      this.form.extras.splice(index, 1)
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        if (this.form.type === 2) {
          this.form.extras.map(item => {
            item.tasks = item.tasks.map(task => {
              return task.taskName
            })
          })
        }
        // 修改的提交
        if (this.form.id != null) {
          updateTaskTemplate(this.form).then(() => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
          return
        }
        // 添加的提交
        createTaskTemplate(this.form).then(() => {
          this.$modal.msgSuccess('创建成功')
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
        return deleteTaskTemplate(id)
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
.form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-card {
    margin-bottom: 20px;
  }

  .outer, .inter {
    color: #F56C6C;
    font-size: 16px;
    top: 8px;
    right: 8px;
  }
}
</style>
