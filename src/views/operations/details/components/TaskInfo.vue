<template>
  <div>
    <el-card style="margin-bottom: 15px">
      <!-- 操作工具栏 -->
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                     v-hasPermi="['operations:task:create']">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-input v-show="showSearch" v-model="queryParams.name" size="mini" placeholder="请输入任务名称" clearable
                    @keyup.enter.native="handleQuery"/>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>
    <el-card>
      <!--切换状态-->
      <el-tabs v-model="queryParams.status" @tab-click="bindTab">
        <el-tab-pane v-for="item in tabsList" :key="item.value" :label="item.label" :name="item.value" />
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
            <template v-if="item.prop == 'operate'">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(row)"
                         v-hasPermi="['operations:task:update']">编辑</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                         v-hasPermi="['operations:task:delete']">删除</el-button>
            </template>
            <template v-else-if="item.prop === 'status'">
              <el-tag size="mini" :type="row.statusColor">{{row.statusDesc}}</el-tag>
            </template>
            <span v-else>{{ row[item.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="550" append-to-body>
      <el-form ref="params" :model="params" :rules="rules" label-width="130px">
        <div v-for="(item, index) in params.form" :key="index" v-show="index === currentIndex">
          <el-form-item label="任务模板" v-if="!isEdit">
            <el-select v-model="item.templateId" filterable placeholder="请选择" style="width: 100%" @change="bindTempType">
              <el-option v-for="i in taskTempList" :key="i.id" :label="i.name" :value="i.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="子任务名称" :prop="'form.'+ index + '.name'" :rules="rules.name">
            <el-input v-model="item.name" placeholder="子任务名称"/>
          </el-form-item>
          <el-form-item label="执行人">
            <el-select v-model="item.blameId" style="width: 100%" filterable placeholder="请选择">
              <el-option v-for="i in userList" :key="parseInt(i.id)" :label="i.nickname"
                         :value="parseInt(i.id)"/>
            </el-select>
          </el-form-item>
          <el-form-item label="预估工时(h)" :prop="'form.'+ index + '.plannedWorkMinute'" :rules="rules.plannedWorkMinute" v-if="taskType === 0">
            <el-input-number v-model="item.plannedWorkMinute" :precision="1" controls-position="right" :min="0" style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item label="生效方式" :prop="'form.'+ index + '.mode'" :rules="rules.mode" v-if="taskType === 0">
            <el-select v-model="item.mode" placeholder="生效方式" style="width: 100%">
              <el-option v-for="(i, index) in modeOptions" :key="index" :label="i.label" :value="i.type" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间" :prop="'form.'+ index + '.beginTime'" :rules="rules.beginTime" v-if="taskType === 0 && item.mode === 1">
            <el-date-picker clearable size="small" style="width: 100%" v-model="item.beginTime" type="date"
                            value-format="timestamp" placeholder="开始时间"/>
          </el-form-item>
          <el-form-item label="选择任务" :prop="'form.'+ index + '.preTaskId'" :rules="rules.preTaskId" v-if="taskType === 0 && item.mode === 2">
            <el-select v-model="item.preTaskId" placeholder="选择任务" style="width: 100%">
              <el-option v-for="i in taskOptions" :key="i.id" :label="i.name" :value="i.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="计划数量" :prop="'form.'+ index + '.extra.plannedQty'" :rules="rules.extra.plannedQty" v-if="taskType === 1">
            <el-input-number v-model="item.extra.plannedQty" controls-position="right" :min="1" style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item label="开始时间" :prop="'form.'+ index + '.beginTime'" :rules="rules.beginTime" v-if="taskType === 1">
            <el-date-picker clearable size="small" style="width: 100%" v-model="item.beginTime" type="date"
                            value-format="timestamp" placeholder="开始时间"/>
          </el-form-item>
          <el-form-item label="结束时间" :prop="'form.'+ index + '.endTime'" :rules="rules.endTime">
            <el-date-picker clearable size="small" style="width: 100%" v-model="item.endTime" type="date"
                            value-format="timestamp" placeholder="结束时间"/>
          </el-form-item>
          <el-form-item label="是否紧急">
            <el-switch v-model="item.urgent" :active-value="1" :inactive-value="0"></el-switch>
          </el-form-item>
          <el-form-item label="委外费用(¥)" :prop="'form.'+ index + '.outsourcingCost'" :rules="rules.outsourcingCost">
            <el-input-number v-model="item.outsourcingCost" controls-position="right" :min="0" style="width: 100%"></el-input-number>
          </el-form-item>
        </div>
      </el-form>
      <template slot="footer">
        <el-button v-if="!isEdit" plain @click="preNextTask(-1)" :disabled="currentIndex <= 0">上一条</el-button>
        <el-button v-if="!isEdit" plain @click="preNextTask(1)" :disabled="currentIndex >= params.form.length - 1" style="margin-right: 40px">下一条</el-button>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </drawer-plus>
  </div>
</template>

<script>
import {
  getTaskPage,
  createTaskBatch,
  getTaskSimpleList,
  getTask,
  updateTask,
  deleteTask
} from '@/api/operations/overview'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { listSimpleUsers } from '@/api/system/user'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { formatMinuteToHour } from '@/utils'
import { getTaskTemplate, getTaskTemplateList } from '@/api/operations/taskTemplate'

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
        status: 'all',
        projectId: null,
        pageNo: 1,
        pageSize: 10
      },
      // 基础表头
      tableHeader: [],
      // 当前表单所处的位置
      currentIndex: 0,
      // 表单参数
      params: {
        form: [{
          projectId: null, // 项目id
          type: null, // 项目类型
          templateId: null, // 任务模板id
          name: null, // 任务名称
          blameId: null, // 执行人
          plannedWorkMinute: null, // 预计工时(分钟)
          extra: {
            plannedQty: 1 // 计划数量
          },
          preTaskId: null, // 前置任务
          mode: 1, // 生效方式
          beginTime: new Date().getTime(), // 开始时间
          endTime: null, // 结束时间
          urgent: 0, // 是否紧急
          outsourcingCost: 0, // 委外费用
          isFilled: false
        }]
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: '子任务名称不能为空', trigger: 'blur' },
          { max: 30, message: '子任务名称不能超过30个字', trigger: 'blur' }
        ],
        plannedWorkMinute: [
          { required: true, type: 'number', message: '预计工时不能为空', trigger: 'blur' },
          { required: true, type: 'number', message: '预计工时不能为空', trigger: 'change' },
          { validator: validatePlannedWorkMinute, trigger: 'blur' }
        ],
        extra: {
          plannedQty: { required: true, type: 'number', message: '计划数量不能为空', trigger: 'blur' }
        },
        preTaskId: { required: true, message: '选择任务不能为空', trigger: 'change' },
        mode: { required: true, message: '生效方式不能为空', trigger: 'change' },
        beginTime: { required: true, type: 'date', message: '开始时间不能为空', trigger: 'change' },
        endTime: { required: true, type: 'date', message: '结束时间不能为空', trigger: 'change' },
        outsourcingCost: { required: true, type: 'number', message: '委外费用不能为空', trigger: 'blur' }
      },
      // 是否是编辑
      isEdit: false
    }
  },
  props: {
    beginEndTime: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  created() {
    this.getUserList()
    this.getTaskTempList(this.taskType)
    this.getTaskSimpleList(this.proId)
    this.getList()
  },
  computed: {
    // 任务类型 0:项目管理 1:生产管理 2:设备维保
    taskType() {
      return Number(this.$route.query.type)
    },
    proId() {
      return this.$route.query.id
    },
    tabsList() {
      return [
        { value: 'all', label: '全部' },
        ...this.tabList
      ]
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
        { prop: 'completedTime', label: '完成时间', width: 160 },
        { prop: 'operate', label: '操作', width: 120, fixed: 'right'}
      ]
    } else if (this.taskType === 1) {
      // 生产管理
      typeHead = [
        { prop: 'name', label: '任务名称', width: 200 },
        { prop: 'blameName', label: '执行人' },
        { prop: 'hours', label: '计划数量' },
        { prop: 'hours', label: '已完成数量' },
        { prop: 'outsourcingCost', label: '不合格数量' },
        { prop: 'status', label: '状态' },
        { prop: 'activatedTime', label: '开始时间', width: 160 },
        { prop: 'completedTime', label: '完成时间', width: 160 },
        { prop: 'operate', label: '操作', width: 120, fixed: 'right'}
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
    getTaskTempList(type) {
      getTaskTemplateList({type}).then(response => {
        const taskTempList = response.data
        this.taskTempList = taskTempList.filter(item => item.type === this.taskType)
      })
    },
    /** 获得任务模板详情 */
    getTaskTemplate(id) {
      getTaskTemplate(id).then(response => {
        const { data } = response;
        const [tempObj] = this.params.form;
        const temp = JSON.parse(JSON.stringify(tempObj))
        this.params.form = data.extras.map(item => {
          return {
            ...temp,
            name: item.name,
            blameId: item.blameId,
            extra: {
              ...temp.extra
            }
          }
        })
      })
    },
    /** 获取任务精简列表 */
    getTaskSimpleList(projectId) {
      getTaskSimpleList({projectId}).then(response => {
        this.taskOptions = response.data
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      const params = {
        ...this.queryParams,
        projectId: this.proId,
        status: this.queryParams.status === 'all' ? null : this.queryParams.status
      }
      getTaskPage(params).then(response => {
        const { list, total } = response.data;
        list.map(item => {
          item.blameName = item.blame?.nickname || ''
          item.estimatedHours = formatMinuteToHour(item?.plannedWorkMinute || 0)
          item.consumedHours = formatMinuteToHour(item?.consumedWorkMinute || 0)
          item.activatedTime = parseTime(item.activatedTime)
          item.completedTime = parseTime(item.completedTime)
          item.statusDesc = this.tabList.find(i => parseInt(i.value) === item.status).label
          item.statusColor = this.tabList.find(i => parseInt(i.value) === item.status).colorType
          item.outsourcingCost = (item.outsourcingCost / 100).toFixed(2)
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isEdit = true;
      getTask(row.id).then(response => {
        const { data } = response;
        const modeValue = data.preTaskId ? 2 : 1;
        this.params.form = new Array(this.params.form.length).fill(data);
        this.params.form.forEach(item => {
          if (item.outsourcingCost) {
            item.outsourcingCost = (item.outsourcingCost / 100).toFixed(2);
          }
          if (item.plannedWorkMinute) {
            item.plannedWorkMinute = (item.plannedWorkMinute / 60).toFixed(2);
          }
          item.mode = modeValue;
        });
        this.open = true;
        this.title = '修改';
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const name = row.name;
      this.$modal.confirm('是否确认删除任务名称为"' + name + '"的数据项?').then(function() {
        return deleteTask(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 修改模板类型 */
    bindTempType(id) {
      this.getTaskTemplate(id)
      const [beginTime, endTime] = this.beginEndTime
      this.params.form.forEach(item => {
        item.beginTime = beginTime
        item.endTime = endTime
      })
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.currentIndex = 0
      this.params = {
        form: [{
          projectId: null, // 项目id
          type: null, // 项目类型
          templateId: null, // 任务模板id
          name: null, // 任务名称
          blameId: null, // 执行人
          plannedWorkMinute: null, // 预计工时(分钟)
          extra: {
            plannedQty: 1 // 计划数量
          },
          preTaskId: null, // 前置任务
          mode: 1, // 生效方式
          beginTime: new Date().getTime(), // 开始时间
          endTime: null, // 结束时间
          urgent: 0, // 是否紧急
          outsourcingCost: 0 // 委外费用
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
      this.isEdit = false
      this.open = true
      this.title = '添加'
    },
    /** 上一条或者下一条任务 */
    preNextTask(step) {
      this.currentIndex = Math.max(0, Math.min(this.currentIndex + step, this.params.form.length - 1));
      if (step === 1) {
        this.params.form[this.currentIndex].beginTime = this.params.form[this.currentIndex - 1].beginTime
        this.params.form[this.currentIndex].endTime = this.params.form[this.currentIndex - 1].endTime
        this.taskType === 0 && (this.params.form[this.currentIndex].plannedWorkMinute = this.params.form[this.currentIndex - 1].plannedWorkMinute)
        this.taskType === 1 && (this.params.form[this.currentIndex].extra.plannedQty = this.params.form[this.currentIndex - 1].extra.plannedQty)
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['params'].validate(valid => {
        if (!valid) {
          return
        }
        // 添加的提交
        // const currentTime = new Date().getTime();
        const paramsArr = JSON.parse(JSON.stringify(this.params.form))
        paramsArr.map(item => {
          // if (this.taskType === 0 && item.mode === 2) {
          //   item.beginTime = currentTime
          // }
          item.projectId = this.proId
          item.type = this.taskType === 0 ? 0 : 10
          item.outsourcingCost = item.outsourcingCost * 100
          item.plannedWorkMinute = item.plannedWorkMinute * 60
          item.extra = {
            ...item.extra
          }
        })
        if (this.isEdit) {
          const [params] = paramsArr
          updateTask(params).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
        } else {
          createTaskBatch(paramsArr).then(response => {
            this.$modal.msgSuccess('新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    }
  }
}
</script>
