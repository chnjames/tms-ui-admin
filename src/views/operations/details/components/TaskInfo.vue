<template>
  <div>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:factory-area:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-input v-show="showSearch" v-model="queryParams.name" size="mini" placeholder="请输入任务名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--切换状态-->
    <el-tabs v-model="queryParams.status" @tab-click="bindTab">
      <el-tab-pane v-for="item in tabList" :key="item.value" :label="item.label" :name="item.value" />
    </el-tabs>
    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column
        v-for="(item, index) in tableHeader"
        :key="index"
        :prop="item.prop"
        :width="item.width"
        :fixed="item.fixed"
        :label="item.label">
        <template v-slot="{row}">
          <template v-if="item.prop === 'operation'">
            <template v-if="taskType === 1">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(row)"
                         v-hasPermi="['config:factory-area:update']">编辑</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                         v-hasPermi="['config:factory-area:delete']">删除</el-button>
            </template>
            <template v-else>
              <el-button size="mini" type="text" icon="el-icon-upload2" @click="handleTop(row)"
                         v-hasPermi="['config:factory-area:update']">置顶</el-button>
              <el-tooltip content="上移一行">
                <i class="el-icon-top operate" style="color: #E6A23C"></i>
              </el-tooltip>
              <el-tooltip content="下移一行">
                <i class="el-icon-bottom operate" style="color: #409EFF"></i>
              </el-tooltip>
            </template>
          </template>
          <template v-else-if="item.prop === 'blameName'">
            <span>{{ row.blame.nickname }}</span>
          </template>
          <template v-else-if="item.prop === 'estimatedHours'">
            <span>{{ row.extra.plannedWorkMinute }}</span>
          </template>
          <template v-else-if="item.prop === 'consumedHours'">
            <span>{{ row.extra.consumedWorkMinute }}</span>
          </template>
          <template v-else-if="item.prop === 'beginTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <template v-else-if="item.prop === 'completedTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="550" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="子任务名称" prop="name">
          <el-input v-model="form.name" placeholder="给目标起个名字"/>
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="form.executorId" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="计划数量" prop="planQuantity" v-if="taskType === 2">
          <el-input-number v-model="form.planQuantity" controls-position="right" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="预估工时(h)" prop="hours" v-if="taskType === 1">
          <el-input-number v-model="form.hours" controls-position="right" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="内部关注人">
          <el-select v-model="form.internalIds" style="width: 100%" :multiple-limit="10" filterable multiple placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="外部关注人">
          <el-select v-model="form.externalIds" style="width: 100%" :multiple-limit="10" filterable multiple placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="首任务开始时间" prop="firstBeginTime" v-if="taskType === 2">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.firstBeginTime" type="date"
                          value-format="timestamp" placeholder="选择首任务开始时间"/>
        </el-form-item>
        <el-form-item label="生效方式" prop="mode" v-if="taskType === 1">
          <el-select v-model="form.mode" placeholder="生效方式" style="width: 100%">
            <el-option v-for="(item, index) in modeOptions" :key="index" :label="item.label" :value="item.type" />
          </el-select>
        </el-form-item>
        <template v-if="taskType === 1">
          <template  v-if="form.mode === 1">
            <el-form-item label="计划开始时间" prop="beginTime">
              <el-date-picker clearable size="small" style="width: 100%" v-model="form.beginTime" type="date"
                              value-format="timestamp" placeholder="选择开始时间"/>
            </el-form-item>
            <el-form-item label="计划结束时间" prop="endTime">
              <el-date-picker clearable size="small" style="width: 100%" v-model="form.endTime" type="date"
                              value-format="timestamp" placeholder="选择结束时间"/>
            </el-form-item>
          </template>
          <el-form-item label="选择任务触发" prop="taskId" v-else>
            <el-select v-model="form.taskId" placeholder="选择任务触发" style="width: 100%">
              <el-option v-for="(item, index) in taskOptions" :key="index" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="是否紧急">
          <el-switch v-model="form.emergency"></el-switch>
        </el-form-item>
        <el-form-item label="委外费用(¥)">
          <el-input-number v-model="form.outsourceCost" controls-position="right" :min="0" style="width: 100%"></el-input-number>
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
  createFactoryArea,
  deleteFactoryArea,
  getFactoryArea,
  updateFactoryArea
} from '@/api/config/factoryArea'
import { getTaskPage } from '@/api/operations/overview'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { listSimpleUsers } from '@/api/system/user'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'TaskInfo',
  components: { DrawerPlus },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户列表
      userList: [],
      // 子任务列表
      taskOptions: [],
      // tabs列表
      tabList: getDictDatas(DICT_TYPE.OPERATIONS_TASK_STATUS),
      // 生效方式Options
      modeOptions: [
        { type: 1, label: '选择开始时间' },
        { type: 2, label: '选择任务触发' }
      ],
      // 任务详情列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: null,
        status: '0',
        pageNo: 1,
        pageSize: 10
      },
      // 基础表头
      tableHeader: [],
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        executorId: undefined, // 执行人
        planQuantity: undefined, // 计划数量(生产管理)
        hours: undefined, // 预计工时
        internalIds: [],
        externalIds: [],
        firstBeginTime: undefined, // 首任务开始时间(生产管理)
        mode: undefined,
        beginTime: undefined,
        endTime: undefined,
        taskId: undefined,
        emergency: false,
        outsourceCost: 0
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
    this.getUserList()
  },
  computed: {
    // 任务类型 0:项目管理 1:生产管理 2:设备维保
    taskType() {
      return this.$route.query.type
    },
  },
  mounted() {
    // 根据任务类型设置表头
    let typeHead = []
    const parType = parseInt(this.taskType)
    if (parType === 0) {
      // 项目管理
      typeHead = [
        { prop: 'name', label: '任务名称', width: 200 },
        { prop: 'blameName', label: '执行人' },
        { prop: 'estimatedHours', label: '预计工时' },
        { prop: 'consumedHours', label: '消耗工时' },
        { prop: 'outsourcingCost', label: '委外费用(¥)' },
        { prop: 'status', label: '状态' },
        { prop: 'beginTime', label: '开始时间', width: 160 },
        { prop: 'completedTime', label: '完成时间', width: 160 }
      ]
    } else if (parType === 1) {
      // 生产管理
      typeHead = [
        { prop: 'name', label: '子任务名称', width: 200 },
        { prop: 'blameName', label: '执行人' },
        { prop: 'hours', label: '计划数量' },
        { prop: 'hours', label: '已完成数量' },
        { prop: 'outsourceCost', label: '不合格数量' },
        { prop: 'status', label: '状态' },
        { prop: 'beginTime', label: '开始时间', width: 160 },
        { prop: 'completedTime', label: '完成时间', width: 160 },
      ]
    }
    this.tableHeader = typeHead
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getTaskPage(this.queryParams).then(response => {
        const { list, total } = response.data;
        this.list = list;
        this.total = total;
        this.loading = false;
      });
    },
    /* 切换状态 */
    bindTab(tab) {
      this.queryParams.status = tab.name
      this.getList()
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
    /** 置顶按钮操作 */
    handleTop(row) {
      const id = row.id
      console.log(id)
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
.operate {
  padding-left: 10px;
  cursor: pointer;
}
</style>
