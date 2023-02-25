<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form v-show="showSearch" :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item prop="type">
        <el-select v-model="queryParams.type" placeholder="设备类型" clearable>
          <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.type" :value="item.type"/>
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
        <el-button plain icon="el-icon-delete" size="mini" @click="handleAdd"
                   v-hasPermi="['config:device:create']">批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="el-icon-download" size="mini" @click="handleAdd"
                   v-hasPermi="['config:device:create']">模板下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-upload2" size="mini" @click="handleAdd"
                   v-hasPermi="['config:device:create']">批量上传</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" ref="multipleTable">
      <!--选择-->
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="设备编码" prop="name"/>
      <el-table-column label="设备名称" prop="description"/>
      <el-table-column label="模板类型" prop="description"/>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
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
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form class="form" ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备名称" prop="equipmentName">
          <el-select v-model="form.equipmentName" placeholder="请选择设备名称" clearable style="width: 100%">
            <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.name" :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-form-item label="模板类型" prop="templateType">
          <el-select v-model="form.templateType" placeholder="请选择模板类型" clearable style="width: 100%">
            <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.name" :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-card shadow="never" v-for="(item, index) in form.partsList" :key="index">
          <el-row :gutter="10" type="flex" justify="space-between">
            <el-col :span="23">
              <el-form-item label="设备部位" :prop="'partsList.'+ index + '.location'" :rules="partsListRules.location">
                <el-input v-model="item.location" placeholder="请输入设备部位"/>
              </el-form-item>
              <el-form-item label="部位图片" :prop="'partsList.' + index + '.image'" :rules="partsListRules.image">
                <imageUpload v-model="item.image" :limit="1" :is-show-tip="false"/>
              </el-form-item>
              <el-card shadow="never" v-for="(task, idx) in item.taskList" :key="idx">
                <el-row :gutter="10" type="flex" justify="space-between">
                  <el-col :span="23">
                    <el-form-item label="任务名称" :prop="'partsList.' + index + '.taskList.' + idx + '.taskName'" :rules="taskListRules.taskName">
                      <el-input v-model="task.taskName" placeholder="请输入任务名称"/>
                    </el-form-item>
                    <el-form-item label="执行结果" required>
                      <el-row :gutter="20" type="flex" justify="space-between">
                        <el-col :span="8">
                          <el-form-item :prop="'partsList.' + index + '.taskList.' + idx + '.outcome'" :rules="taskListRules.outcome">
                            <el-select v-model="task.outcome" style="width: 100%" placeholder="请选择执行结果" clearable>
                              <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.name" :value="item.name"/>
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="4">
                          <el-form-item :prop="'partsList.' + index + '.taskList.' + idx + '.termOne'" :rules="taskListRules.termOne">
                            <el-select v-model="task.termOne" style="width: 100%" placeholder="请选择" clearable>
                              <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.name" :value="item.name"/>
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="4">
                          <el-form-item :prop="'partsList.' + index + '.taskList.' + idx + '.valueOne'" :rules="taskListRules.valueOne">
                            <el-input v-model="task.valueOne" placeholder="数值"/>
                          </el-form-item>
                        </el-col>
                        <el-col :span="4">
                          <el-form-item :prop="'partsList.' + index + '.taskList.' + idx + '.termTwo'" :rules="taskListRules.termTwo">
                            <el-select v-model="task.termTwo" style="width: 100%" placeholder="请选择" clearable>
                              <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.name" :value="item.name"/>
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="4">
                          <el-form-item :prop="'partsList.' + index + '.taskList.' + idx + '.valueTwo'" :rules="taskListRules.valueTwo">
                            <el-input v-model="task.valueTwo" placeholder="数值"/>
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-form-item>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="选择备件" :prop="'partsList.' + index + '.taskList.' + idx + '.spare'" :rules="taskListRules.spare">
                          <el-select v-model="task.spare" style="width: 100%" placeholder="请选择" clearable>
                            <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.name" :value="item.name"/>
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="备件数量" :prop="'partsList.' + index + '.taskList.' + idx + '.quantity'" :rules="taskListRules.quantity">
                          <el-input-number v-model="task.quantity" :min="0" />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-col>
                  <i class="inter el-icon-delete"  v-if="item.taskList.length > 1" @click="deleteInterItems(task, idx)"></i>
                </el-row>
              </el-card>
              <el-button type="primary" icon="el-icon-plus" @click="addInterItems(item, index)" plain style="margin-top: 10px;width: 100%">添加任务项</el-button>
            </el-col>
            <i class="outer el-icon-delete" v-if="form.partsList.length > 1" @click="deleteOuterItems(item, index)"></i>
          </el-row>
        </el-card>
        <!--添加外层内容-->
        <el-button type="primary" plain icon="el-icon-plus" @click="addOuterItems" style="margin-top: 10px;width: 100%">添加部位 & 任务项</el-button>
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
  getFactoryArea,
  getFactoryAreaPage,
  getSimpleFactoryArea,
  updateFactoryArea
} from '@/api/config/factoryArea'
import ImageUpload from '@/components/ImageUpload/index.vue'

export default {
  name: 'Template',
  components: {
    ImageUpload
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 工厂区域列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: null
      },
      // 表单参数
      form: {
        equipmentName: undefined, // 设备名称
        templateType: undefined, // 模板类型
        partsList: [
          {
            location: undefined, // 设备部位
            image: undefined, // 图片
            taskList: [
              {
                taskName: undefined, // 任务名称
                outcome: undefined, // 执行结果
                termOne: undefined, // 条件1
                valueOne: undefined, // 条件1的值
                termTwo: undefined, // 条件2
                valueTwo: undefined, // 条件2的值
                spare: undefined, // 备件
                previous: undefined, // 前值
                after: undefined, // 后值
                quantity: 0 // 备件数量
              }
            ]
          }
        ]
      },
      // 表单校验
      rules: {
        equipmentName: [
          { required: true, message: '设备名称不能为空', trigger: 'blur' },
          { max: 30, message: '设备名称不能超过30个字', trigger: 'blur' }
        ],
        templateType: [
          { required: true, message: '模板类型不能为空', trigger: 'blur' },
          { max: 30, message: '模板类型不能超过30个字', trigger: 'blur' }
        ]
      },
      partsListRules: {
        location: [
          { required: true, message: '设备部位不能为空', trigger: 'blur' },
          { max: 30, message: '设备部位不能超过30个字', trigger: 'blur' }
        ],
        image: [
          { required: true, message: '图片不能为空', trigger: 'blur' }
        ]
      },
      taskListRules: {
        taskName: [
          { required: true, message: '任务名称不能为空', trigger: 'blur' },
          { max: 30, message: '任务名称不能超过30个字', trigger: 'blur' }
        ],
        outcome: [
          { required: true, message: '执行结果不能为空', trigger: 'blur' },
          { max: 30, message: '执行结果不能超过30个字', trigger: 'blur' }
        ],
        termOne: [
          { required: true, message: '条件1不能为空', trigger: 'blur' },
          { max: 30, message: '条件1不能超过30个字', trigger: 'blur' }
        ],
        valueOne: [
          { required: true, message: '条件1的值不能为空', trigger: 'blur' },
          { max: 30, message: '条件1的值不能超过30个字', trigger: 'blur' }
        ],
        termTwo: [
          { required: true, message: '条件2不能为空', trigger: 'blur' },
          { max: 30, message: '条件2不能超过30个字', trigger: 'blur' }
        ],
        valueTwo: [
          { required: true, message: '条件2的值不能为空', trigger: 'blur' },
          { max: 30, message: '条件2的值不能超过30个字', trigger: 'blur' }
        ],
        spare: [
          { required: true, message: '备件不能为空', trigger: 'blur' },
          { max: 30, message: '备件不能超过30个字', trigger: 'blur' }
        ],
        previous: [
          { required: true, message: '前值不能为空', trigger: 'blur' },
          { max: 30, message: '前值不能超过30个字', trigger: 'blur' }
        ],
        after: [
          { required: true, message: '后值不能为空', trigger: 'blur' },
          { max: 30, message: '后值不能超过30个字', trigger: 'blur' }
        ],
        quantity: [
          { required: true, message: '备件数量不能为空', trigger: 'blur' }
        ]
      },
      // 菜单树选项
      menuOptions: []
    }
  },
  created() {
    this.getList()
    this.getSimpleFactoryArea()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getFactoryAreaPage(this.queryParams).then(response => {
        this.list = this.handleTree(response.data)
        this.loading = false
      })
    },
    /** 获取厂区精简信息列表 */
    getSimpleFactoryArea() {
      getSimpleFactoryArea().then(response => {
        this.menuOptions = []
        const menu = { id: 0, name: '顶级', children: [] }
        menu.children = this.handleTree(response.data)
        this.menuOptions.push(menu)
      })
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      // this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        description: undefined,
        parentId: undefined
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
      // this.reset()
      this.open = true
      this.title = '添加'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      getFactoryArea(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改'
      })
    },
    /** 添加任务项操作 */
    addInterItems(item, index) {
      console.log(item, index)
      item.taskList.push({
        taskName: undefined, // 任务名称
        outcome: undefined, // 执行结果
        termOne: undefined, // 条件1
        valueOne: undefined, // 条件1的值
        termTwo: undefined, // 条件2
        valueTwo: undefined, // 条件2的值
        spare: undefined, // 备件
        previous: undefined, // 前值
        after: undefined, // 后值
        quantity: 0 // 备件数量
      })
    },
    /** 删除任务项操作 */
    deleteInterItems(task, idx) {
      console.log(task, idx)
      this.form.partsList[idx].taskList.splice(task, 1)
    },
    /** 添加部位&任务项操作 */
    addOuterItems() {
      this.form.partsList.push({
        location: undefined,
        image: undefined,
        taskList: [
          {
            taskName: undefined, // 任务名称
            outcome: undefined, // 执行结果
            termOne: undefined, // 条件1
            valueOne: undefined, // 条件1的值
            termTwo: undefined, // 条件2
            valueTwo: undefined, // 条件2的值
            spare: undefined, // 备件
            previous: undefined, // 前值
            after: undefined, // 后值
            quantity: 0 // 备件数量
          }
        ]
      })
    },
    /** 删除部位&任务项操作 */
    deleteOuterItems(item, index) {
      console.log(item, index)
      this.form.partsList.splice(index, 1)
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
            this.getSimpleFactoryArea()
          })
          return
        }
        // 添加的提交
        createFactoryArea(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
          this.getSimpleFactoryArea()
        })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      console.log(row)
      const name = row.name
      const id = row.id
      this.$modal.confirm('是否确认删除名称为"' + name + '"的数据项?').then(function() {
        return deleteFactoryArea(id)
      }).then(() => {
        this.getList()
        this.getSimpleFactoryArea()
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
