<template>
  <div class="overview-container">
    <div class="search">
      <el-row type="flex" justify="end">
        <el-col :xs="12" :sm="12" :md="12" :lg="16" :xl="16">
          <el-input placeholder="请输入" v-model="searchName" class="search-input"/>
        </el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="4">
          <el-button-group>
            <el-button type="primary" v-for="item in fileBusinessTypeList" :key="item.value" @click="handleSearch(item.value)">{{item.label}}搜索</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </div>
    <el-card shadow="never">
      <!-- 搜索工作栏 -->
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item prop="status">
          <el-radio-group v-model="queryParams.status" @change="handleQuery">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button :label="item.value" v-for="(item, index) in statusList" :key="index">{{item.label}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="timeScope">
          <el-date-picker v-model="queryParams.timeScope" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                          type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                          :default-time="['00:00:00', '23:59:59']"/>
        </el-form-item>
        <el-form-item prop="fieldType">
          <el-select v-model="queryParams.fieldType" placeholder="选择类型" @change="bindFieldChange">
            <el-option v-for="item in fieldTypeList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-if="queryParams.fieldType === 1" v-model="queryParams.name" placeholder="请输入项目名称" clearable
                    @keyup.enter.native="handleQuery"/>
          <el-select v-if="queryParams.fieldType === 2" v-model="queryParams.blameId" placeholder="选择责任人"
                     clearable>
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
          <el-select v-if="queryParams.fieldType === 3" v-model="queryParams.type" placeholder="选择项目类型" clearable>
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="parseInt(item.value)"/>
          </el-select>
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
        <!--<el-col :span="1.5">
          <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                     :loading="exportLoading" v-hasPermi="['warehouse:material:export']">导出</el-button>
        </el-col>-->
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="list">
        <el-table-column label="项目名称" prop="name" min-width="280">
          <template v-slot="{row}">
            <div class="project-name" @click.stop="bindProject(row)">{{ row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="负责人" align="center" prop="header" width="180"/>
        <el-table-column label="项目类型" align="center" prop="typeDesc" width="180"/>
        <el-table-column label="开始时间" align="center" prop="beginTime" width="180"/>
        <el-table-column label="结束时间" align="center" prop="endTime" width="180"/>
        <el-table-column label="状态" align="center" prop="status" width="180">
          <template v-slot="{row}">
            <el-tag size="mini" :type="row.statusColor">{{row.statusDesc}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="项目进度" align="center" prop="progress" width="200">
          <template v-slot="{row}">
            <el-progress :percentage="row.progress > 100 ? 100 : row.progress" :color="row.progressColor" :format="progressFormat(row.progress)"></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width" width="200">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-view" @click="bindProject(row)"
                       v-hasPermi="['operations:project:query']">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                       v-hasPermi="['operations:project:delete']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList"/>
    </el-card>

    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width: 100%" placeholder="请选择">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="parseInt(item.value)"/>
          </el-select>
        </el-form-item>
        <!--设备维保类型-->
        <el-form-item v-if="form.type === 2" label="设备名称" prop="device">
          <el-select v-model="form.device" style="width: 100%" filterable placeholder="请选择"
                     @change="bindDeviceChange">
            <el-option v-for="(item, index) in deviceList" :key="index" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 2 && form.device" label="设备编号">
          <div>{{ form.deviceCode }}</div>
        </el-form-item>
        <!--项目管理类型-->
        <el-form-item v-if="form.type === 0" label="项目类型">
          <div>普通型(子任务设置无先后顺序)</div>
        </el-form-item>
        <!--生产管理类型-->
        <el-form-item v-if="form.type === 1" label="项目类型">
          <div>流程型(子任务顺序执行)</div>
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="标题" prop="name">
          <el-input v-model="form.name" placeholder="给目标起个名字"/>
        </el-form-item>
        <el-form-item label="负责人" :prop="form.type === 0 || form.type === 1 ? '': 'blameId'">
          <el-select v-model="form.blameId" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="内部关注人" prop="followerIds">
          <el-select v-model="form.followerIds" style="width: 100%" collapse-tags :multiple-limit="10" filterable multiple placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.beginTime" type="date"
                          value-format="timestamp" placeholder="选择开始时间" @change="updateEndTime"/>
        </el-form-item>
        <el-form-item label="任务周期" prop="period">
          <el-select v-model="form.period" placeholder="选择任务周期" clearable style="width: 100%">
            <el-option v-for="(item, index) in periodList" :key="index" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable :disabled="isEndTime" size="small" style="width: 100%" v-model="form.endTime" type="date"
                          value-format="timestamp" placeholder="选择结束时间"/>
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
import { getDevicePage } from '@/api/config/device'
import {
createOverview,
deleteOverview,
exportOverviewExcel,
getOverviewPage,
updateOverview
} from '@/api/operations/overview'
import { listSimpleUsers } from '@/api/system/user'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'Overview',
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
      // 用户列表
      userList: [],
      // 总条数
      total: 0,
      // 项目列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 搜索名称
      searchName: '',
      // 字段类型列表
      fieldTypeList: [
        { label: '项目名称', value: 1 },
        { label: '责任人', value: 2 },
        { label: '项目类型', value: 3 }
      ],
      // 项目类型列表
      typeList: getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_TYPE),
      // 项目文件业务类型列表
      fileBusinessTypeList: getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_FILE_BIZ_TYPE),
      // 项目状态列表
      statusList: getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_STATUS),
      // 结束时间是否禁用
      isEndTime: false,
      // 设备列表
      deviceList: [],
      // 任务周期列表
      periodList: [
        { label: '自定义', value: 0 },
        { label: '1周', value: 7 },
        { label: '2周', value: 14 },
        { label: '3周', value: 21 },
        { label: '4周', value: 28 }
      ],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        timeScope: [],
        fieldType: 1, // 字段类型
        status: null, // 状态
        blameId: null, // 责任人
        name: null, // 项目名称 当类型是设备维保时，为设备编码
        type: null
      },
      // 表单参数
      form: {
        id: undefined,
        type: undefined,
        name: undefined, // 项目名称
        device: undefined,
        code: undefined, // 设备编号
        blameId: undefined, // 责任人
        followerIds: [], // 内部关注人
        deviceCode: undefined, // 设备编号
        beginTime: undefined,
        period: 0, // 任务周期
        endTime: undefined
      },
      // 表单校验
      rules: {
        type: [{ required: true, message: '项目类型不能为空', trigger: 'change' }],
        device: [{ required: true, message: '设备不能为空', trigger: 'change' }],
        name: [
          { required: true, message: '项目标题不能为空', trigger: 'blur' },
          { max: 30, message: '项目标题不能超过30个字符', trigger: 'blur' }
        ],
        blameId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        followerIds: [{ required: true, message: '内部关注人不能为空', trigger: 'change' }],
        beginTime: [{ type: 'date', required: true, message: '请选择开始时间', trigger: 'change' }],
        period: [{ required: true, message: '请选择任务周期', trigger: 'change' }],
        endTime: [{ type: 'date', required: true, message: '请选择结束时间', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
    this.getDeviceList()
  },
  watch: {
    'form.period'(val) {
      this.form.endTime = this.form.beginTime + val * 24 * 60 * 60 * 1000;
      this.isEndTime = val !== 0;
    },
  },
  methods: {
    /** 获取设备列表 */
    getDeviceList() {
      getDevicePage({ pageNo: 1, pageSize: 100 }).then(response => {
        this.deviceList = response.data.list
      })
    },
    /** 进度条格式化 */
    progressFormat(progress) {
      return () => {
        return `${progress}%`
      }
    },
    /** 选择设备 */
    bindDeviceChange(val) {
      this.form.deviceCode = this.deviceList.find(item => item.id === val).code
    },
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 更新结束时间 */
    updateEndTime() {
      if (this.form.period === 0 && this.form.type === 1) {
        this.form.endTime = this.form.beginTime;
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getOverviewPage(this.queryParams).then(response => {
        const { list, total } = response.data
        list.map(item => {
          item.beginTime = this.parseTime(item.beginTime, '{y}-{m}-{d}')
          item.endTime = this.parseTime(item.endTime, '{y}-{m}-{d}')
          item.header = item.blame.nickname
          item.typeDesc = this.typeList.find(type => parseInt(type.value) === item.type).label
          item.statusDesc = this.statusList.find(status => parseInt(status.value) === item.status).label
          item.statusColor = this.statusList.find(status => parseInt(status.value) === item.status).colorType
          item.progress = Math.floor((item.rate.current / item.rate.total) * 100)
          if (item.progress < 100) {
            if (item.endTime > new Date().getTime()) {
              item.progressColor = '#409EFF'
            } else {
              item.progressColor = '#F56C6C'
            }
          } else {
            if (item.endTime > new Date().getTime()) {
              item.progressColor = '#67C23A'
            } else {
              item.progressColor = '#909399'
            }
          }
        })
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 项目详情 */
    bindProject(row) {
      this.$router.push({
        path: '/operations/details',
        query: {
          id: row.id,
          type: row.type
        }
      })
    },
    /** 选择字段类型 */
    bindFieldChange() {
      this.queryParams.name = null
      this.queryParams.blameId = null
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
        id: undefined,
        type: undefined,
        device: undefined,
        code: undefined,
        name: undefined,
        blameId: undefined,
        followerIds: [], // 内部关注人
        deviceCode: undefined, // 设备编号
        beginTime: undefined,
        endTime: undefined,
        period: 0 // 任务周期
      }
      this.resetForm('form')
    },
    /** 文档/合同搜索 */
    handleSearch(type) {
      this.$router.push({
        path: '/operations/search',
        query: {
          name: this.searchName,
          type
        }
      })
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
      this.title = '新建项目'
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        // 修改的提交
        if (this.form.id != null) {
          updateOverview(this.form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
          return
        }
        // 添加的提交
        createOverview(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      const name = row.name
      this.$modal.confirm('是否确认删除项目名称为"' + name + '"的数据项?').then(function() {
        return deleteOverview(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** 导出按钮操作 */
    // handleExport() {
    //   // 处理查询参数
    //   let params = { ...this.queryParams }
    //   params.pageNo = undefined
    //   params.pageSize = undefined
    //   this.$modal.confirm('是否确认导出所有物料基础数据数据项?').then(() => {
    //     this.exportLoading = true
    //     return exportOverviewExcel(params)
    //   }).then(response => {
    //     this.$download.excel(response, '物料基础数据.xls')
    //     this.exportLoading = false
    //   }).catch(() => {
    //   })
    // }
  }
}
</script>
<style lang="scss" scoped>
.overview-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  height: 100%;
  width: 100%;
  position: absolute;
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
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}
</style>
