<template>
  <div>
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
        :align="item.align"
        :label="item.label">
        <template v-slot="{row}">
          <template v-if="item.prop === 'operation'">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(row)"
                       v-hasPermi="['config:factory-area:update']">编辑</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                       v-hasPermi="['config:factory-area:delete']">删除</el-button>
          </template>
          <template v-else-if="item.prop === 'nextTriggerTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <template v-else-if="item.prop === 'status'">
            <el-switch v-model="row.status" :active-value="0" :inactive-value="1" />
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="550" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="设备名称" prop="device">
          <div>{{form.deviceName}}</div>
        </el-form-item>
        <el-form-item label="子任务名称">
          <el-input v-model="form.name" placeholder="子任务名称" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%" @change="bindTaskType">
            <el-option v-for="item in taskPlanTypeList" :key="item.value" :label="item.label" :value="parseInt(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务模板" prop="taskTemp" v-if="form.type === 0">
          <el-select v-model="form.taskTemp" filterable placeholder="请选择" style="width: 100%">
            <el-option v-for="item in taskTempList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择备件" prop="taskTemp" v-if="form.type === 1">
          <el-select v-model="form.taskTemp" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in materialList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备件数量" prop="spareQuantity" v-if="form.type === 1">
          <el-input-number v-model="form.spareQuantity" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="form.executorId" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="生效方式" prop="mode">
          <el-select v-model="form.mode" placeholder="生效方式" style="width: 100%">
            <el-option v-for="(item, index) in modeOptions" :key="index" :label="item.label" :value="item.type" />
          </el-select>
        </el-form-item>
        <!--生效方式：周期生效-->
        <template  v-if="form.mode === 2">
          <el-form-item>
            <el-select v-model="form.period" placeholder="周期" style="width: 100%">
              <el-option v-for="(item, index) in PeriodTypeOptions" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <!--跳过节假日 是否单选-->
          <el-form-item label="跳过节假日">
            <el-radio-group v-model="form.skipHoliday">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker clearable size="small" style="width: 100%" v-model="form.beginTime" type="datetime"
                            value-format="timestamp" placeholder="选择开始时间"/>
          </el-form-item>
        </template>
        <template v-if="form.mode === 3">
          <el-form-item label="触发时间">
            <el-date-picker clearable size="small" style="width: 100%" v-model="form.timingTime" type="datetime"
                            value-format="timestamp" placeholder="选择时间"/>
          </el-form-item>
        </template>
      </el-form>
      <template slot="footer">
        <!--创建模板-->
        <el-button type="primary" style="margin-right: 20px" @click="bindTaskTemp">创建模板</el-button>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </drawer-plus>
    <!--任务模板-->
    <task-temp :visible.sync="taskTempVisible" title="任务模板" @cancel="bindTaskTempCancel" @submit="bindTaskTempSubmit"></task-temp>
  </div>
</template>

<script>
import {
  createFactoryArea,
  deleteFactoryArea,
  getFactoryArea,
  updateFactoryArea
} from '@/api/config/factoryArea'
import { getTaskPlanPage } from '@/api/operations/overview'
import { getTaskTemplateList } from '@/api/operations/taskTemplate'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import TaskTemp from '@/components/TaskTemp/index.vue'
import { listSimpleUsers } from '@/api/system/user'
import { getDevicePage } from '@/api/config/device'
import { PeriodTypeOptions } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { getMatchMaterialList } from '@/api/warehouse/material'

export default {
  name: 'TaskPlan',
  components: { DrawerPlus, TaskTemp },
  props: {
    content: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // 周期枚举
      PeriodTypeOptions,
      // 任务计划类型
      taskPlanTypeList: getDictDatas(DICT_TYPE.OPERATIONS_TASK_PLAN_TYPE),
      // 任务计划周期
      taskPlanPeriodList: getDictDatas(DICT_TYPE.OPERATIONS_TASK_PLAN_PERIOD),
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户列表
      userList: [],
      // 设备列表
      deviceList: [],
      // 物料列表
      materialList: [],
      // 任务模板列表
      taskTempList: [],
      // 生效方式Options
      modeOptions: [
        { type: 1, label: '立即生效' },
        { type: 2, label: '周期生效' },
        { type: 3, label: '定时触发' }
      ],
      // 任务详情列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        projectId: null,
        pageNo: 1,
        pageSize: 10
      },
      // 表头
      tableHeader: [
        { prop: 'taskName', label: '任务名称' },
        { prop: 'typeDesc', label: '任务类型' },
        { prop: 'periodDesc', label: '周期' },
        { prop: 'blameName', label: '执行人' },
        { prop: 'nextTriggerTime', label: '下次触发时间' },
        { prop: 'status', align: 'center' },
        { prop: 'operation', label: '操作' }
      ],
      // 表单参数
      form: {
        id: undefined,
        deviceName: undefined,
        type: 0,
        taskTemp: undefined, // 任务模板
        executorId: undefined, // 执行人
        spareQuantity: 1, // 备品数量
        mode: undefined,
        skipHoliday: 1, // 跳过节假日
        beginTime: undefined, // 开始时间
        timingTime: undefined // 定时时间
      },
      // 表单校验
      rules: {
        deviceName: [{ required: true, message: '设备不能为空', trigger: 'change' }],
        taskTemp: { required: true, message: '任务模板不能为空', trigger: 'change' },
        mode: { required: true, message: '生效方式不能为空', trigger: 'change' }
      },
      // 任务模板弹出层
      taskTempVisible: false
    }
  },
  created() {
    this.initializeData();
  },
  computed: {
    proId() {
      return this.$route.query.id
    }
  },
  methods: {
    async initializeData() {
      try {
        await Promise.all([
          this.getDeviceList(),
          this.getUserList(),
          this.getTaskTempList(),
          this.getMaterialList()
        ]);
        this.getList();
      } catch (error) {
        console.error('获取数据失败', error);
      }
    },
    /** 获取设备列表 */
    async getDeviceList() {
      try {
        const response = await getDevicePage({ pageNo: 1, pageSize: 100 });
        this.deviceList = response.data.list;
      } catch (error) {
        console.error('获取设备列表失败', error);
        throw error;
      }
    },
    /** 物料列表 */
    async getMaterialList() {
      try {
        const response = await getMatchMaterialList();
        this.materialList = response.data
      } catch (error) {
        console.error('获取物料列表失败', error);
        throw error;
      }
    },
    /** 用户列表 */
    async getUserList() {
      try {
        const response = await listSimpleUsers();
        this.userList = response.data;
      } catch (error) {
        console.error('获取用户列表失败', error);
        throw error;
      }
    },
    /** 获取任务模版列表 */
    async getTaskTempList() {
      try {
        const response = await getTaskTemplateList();
        this.taskTempList = response.data;
      } catch (error) {
        console.error('获取任务模版列表失败', error);
        throw error;
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      this.queryParams.projectId = this.proId
      getTaskPlanPage(this.queryParams).then(response => {
        const {list, total} = response.data
        list.map(item => {
          item.blameName = this.userList.find(user => user.id === item.blameId).nickname
          item.periodDesc = this.taskPlanPeriodList.find(i => parseInt(i.value) === item.period).label
          item.typeDesc = this.taskPlanTypeList.find(i => parseInt(i.value) === item.type).label
        })
        this.list = list;
        this.total = total;
        this.loading = false;
      });
    },
    /** 改变任务类型 */
    bindTaskType(type) {
      console.log(type)
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
        deviceName: undefined,
        type: 0,
        taskTemp: undefined, // 任务模板
        executorId: undefined, // 执行人
        spareQuantity: 1, // 备品数量
        mode: undefined,
        skipHoliday: 1, // 跳过节假日
        beginTime: undefined, // 开始时间
        timingTime: undefined // 定时时间
      }
      this.resetForm('form')
    },
    /** 新增按钮操作 */
    handleAdd() {
      console.log(this.content)
      this.reset()
      this.form.deviceName = this.content.name
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
    /** 创建模板按钮操作 */
    bindTaskTemp() {
      console.log('创建模板')
      this.taskTempVisible = true
    },
    /** 任务模板取消 */
    bindTaskTempCancel() {
      console.log('任务模板取消')
      this.taskTempVisible = false
    },
    /** 任务模板提交 */
    bindTaskTempSubmit() {
      console.log('任务模板提交')
      this.taskTempVisible = false
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
