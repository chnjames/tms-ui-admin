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
          <template v-if="item.prop === 'status'">
            <el-tag size="mini" :type="row.statusColor">{{row.statusDesc}}</el-tag>
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="550" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="任务模板" prop="templateId">
          <el-select v-model="form.templateId" filterable placeholder="请选择" style="width: 100%">
            <el-option v-for="item in taskTempList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子任务名称" prop="name">
          <el-input v-model="form.name" placeholder="子任务名称"/>
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="form.blameId" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="预估工时(h)" prop="extra.plannedWorkMinute" v-if="taskType === 0">
          <el-input-number v-model="form.extra.plannedWorkMinute" :precision="1" controls-position="right" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="生效方式" prop="mode" v-if="taskType === 0">
          <el-select v-model="form.mode" placeholder="生效方式" style="width: 100%">
            <el-option v-for="(item, index) in modeOptions" :key="index" :label="item.label" :value="item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime" v-if="taskType === 0 && form.mode === 1">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.beginTime" type="date"
                          value-format="timestamp" placeholder="开始时间"/>
        </el-form-item>
        <el-form-item label="选择任务" prop="taskId" v-if="taskType === 0 && form.mode === 2">
          <el-select v-model="form.taskId" placeholder="选择任务" style="width: 100%">
            <el-option v-for="(item, index) in taskOptions" :key="index" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划数量" prop="extra.plannedQty" v-if="taskType === 1">
          <el-input-number v-model="form.extra.plannedQty" controls-position="right" :min="1" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime" v-if="taskType === 1">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.beginTime" type="date"
                          value-format="timestamp" placeholder="开始时间"/>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.endTime" type="date"
                          value-format="timestamp" placeholder="结束时间"/>
        </el-form-item>
        <el-form-item label="是否紧急">
          <el-switch v-model="form.urgent"></el-switch>
        </el-form-item>
        <el-form-item label="委外费用(¥)" prop="outsourceCost">
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
import { getTaskPage, createTask } from '@/api/operations/overview'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { listSimpleUsers } from '@/api/system/user'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { formatMinuteToHour } from '@/utils'
import { getTaskTemplateList } from '@/api/operations/taskTemplate'

export default {
  name: 'TaskInfo',
  components: { DrawerPlus },
  data() {
    const validatePlannedWorkMinute = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('预估工时必须大于0'))
      } else {
        callback()
      }
    }
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
      // 任务模板列表
      taskTempList: [],
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
        projectId: null,
        pageNo: 1,
        pageSize: 10
      },
      // 基础表头
      tableHeader: [],
      // 表单参数
      form: {
        id: null,
        projectId: null, // 项目id
        templateId: null, // 任务模板id
        name: null, // 任务名称
        blameId: null, // 执行人
        extra: {
          plannedWorkMinute: null, // 预计工时(分钟)
          plannedQty: 1 // 计划数量
        },
        mode: 1, // 生效方式
        beginTime: null, // 开始时间
        taskId: null, // 选择任务
        endTime: null, // 结束时间
        urgent: false, // 是否紧急
        outsourceCost: 0 // 委外费用
      },
      // 表单校验
      rules: {
        templateId: { required: true, message: '任务模板不能为空', trigger: 'change' },
        name: [
          { required: true, message: '子任务名称不能为空', trigger: 'blur' },
          { max: 30, message: '子任务名称不能超过30个字', trigger: 'blur' }
        ],
        extra: {
          plannedWorkMinute: [
            { required: true, type: 'number', message: '预计工时不能为空', trigger: 'blur' },
            { validator: validatePlannedWorkMinute, trigger: 'blur' }
          ],
          plannedQty: { required: true, type: 'number', message: '计划数量不能为空', trigger: 'blur' }
        },
        mode: { required: true, message: '生效方式不能为空', trigger: 'change' },
        beginTime: { required: true, type: 'date', message: '开始时间不能为空', trigger: 'change' },
        endTime: { required: true, type: 'date', message: '结束时间不能为空', trigger: 'change' },
        taskId: { required: true, message: '选择任务不能为空', trigger: 'change' },
        outsourceCost: { required: true, type: 'number', message: '委外费用不能为空', trigger: 'blur' }
      }
    }
  },
  created() {
    this.getUserList()
    this.getTaskTempList()
    this.getList()
  },
  computed: {
    // 任务类型 0:项目管理 1:生产管理 2:设备维保
    taskType() {
      return Number(this.$route.query.type)
    },
    proId() {
      return this.$route.query.id
    }
  },
  mounted() {
    // 根据任务类型设置表头
    let typeHead = []
    if (this.taskType === 0) {
      // 项目管理
      typeHead = [
        { prop: 'name', label: '任务名称', width: 200 },
        { prop: 'blameName', label: '执行人' },
        { prop: 'estimatedHours', label: '预计工时' },
        { prop: 'consumedHours', label: '消耗工时' },
        { prop: 'outsourcingCost', label: '委外费用(¥)' },
        { prop: 'status', label: '状态' },
        { prop: 'activatedTime', label: '开始时间', width: 160 },
        { prop: 'completedTime', label: '完成时间', width: 160 }
      ]
    } else if (this.taskType === 1) {
      // 生产管理
      typeHead = [
        { prop: 'name', label: '任务名称', width: 200 },
        { prop: 'blameName', label: '执行人' },
        { prop: 'hours', label: '计划数量' },
        { prop: 'hours', label: '已完成数量' },
        { prop: 'outsourceCost', label: '不合格数量' },
        { prop: 'status', label: '状态' },
        { prop: 'activatedTime', label: '开始时间', width: 160 },
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
    /** 获取任务模板列表 */
    getTaskTempList() {
      getTaskTemplateList().then(response => {
        this.taskTempList = response.data
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      this.queryParams.projectId = this.proId
      getTaskPage(this.queryParams).then(response => {
        const { list, total } = response.data;
        list.map(item => {
          item.blameName = item.blame?.name || ''
          item.estimatedHours = formatMinuteToHour(item.extra?.plannedWorkMinute || 0)
          item.consumedHours = formatMinuteToHour(item.extra?.consumedWorkMinute || 0)
          item.activatedTime = parseTime(item.activatedTime)
          item.completedTime = parseTime(item.completedTime)
          item.statusDesc = this.tabList.find(i => parseInt(i.value) === item.status).label
          item.statusColor = this.tabList.find(i => parseInt(i.value) === item.status).colorType
        })
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
        id: null,
        projectId: null, // 项目id
        templateId: null, // 任务模板id
        name: null, // 任务名称
        blameId: null, // 执行人
        extra: {
          plannedWorkMinute: null, // 预计工时(分钟)
          plannedQty: 1 // 计划数量
        },
        mode: 1, // 生效方式
        beginTime: null, // 开始时间
        taskId: null, // 选择任务
        endTime: null, // 结束时间
        urgent: false, // 是否紧急
        outsourceCost: 0 // 委外费用
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
        // 添加的提交
        const params = {
          ...this.form,
          projectId: this.proId,
          extra: {
            ...this.form.extra,
            plannedWorkMinute: this.form.extra.plannedWorkMinute * 60
          }
        }
        createTask(params).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        })
      })
    }
  }
}
</script>
