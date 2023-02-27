<template>
  <div class="overview-container">
    <div class="search">
      <el-row type="flex" justify="end">
        <el-col :xs="12" :sm="12" :md="12" :lg="16" :xl="16">
          <el-input placeholder="请输入" class="search-input"/>
        </el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="4">
          <el-button-group>
            <el-button type="primary" @click="handleSearch">文档搜索</el-button>
            <el-button type="primary" @click="handleSearch">合同搜索</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </div>
    <el-card shadow="never">
      <!-- 搜索工作栏 -->
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item prop="status">
          <el-radio-group v-model="queryParams.status">
            <el-radio-button :label="1">全部</el-radio-button>
            <el-radio-button :label="2">进行中</el-radio-button>
            <el-radio-button :label="3">已完成</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="createTime">
          <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                          type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                          :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
        <el-form-item prop="fieldType">
          <el-select v-model="queryParams.fieldType" placeholder="选择类型" @change="bindFieldChange">
            <el-option v-for="item in fieldTypeList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-if="queryParams.fieldType === 1" v-model="queryParams.name" placeholder="请输入项目名称" clearable
                    @keyup.enter.native="handleQuery"
          />
          <el-select v-if="queryParams.fieldType === 2" v-model="queryParams.blameId" placeholder="选择责任人"
                     clearable
          >
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"
            />
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
                     v-hasPermi="['operations:overview:create']"
          >新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                     :loading="exportLoading"
                     v-hasPermi="['warehouse:material:export']"
          >导出
          </el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="list">
        <el-table-column label="项目名称" prop="name" show-overflow-tooltip>
          <template v-slot="scope">
            <div class="project-name">{{ scope.row.name }}</div>
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column label="负责人" align="center" prop="header"/>
        <el-table-column label="项目类型" align="center" prop="type"/>
        <el-table-column label="开始时间" align="center" prop="beginTime"/>
        <el-table-column label="结束时间" align="center" prop="endTime"/>
        <el-table-column label="项目进度" align="center" prop="progress">
          <template v-slot="{row}">
            <el-progress :percentage="row.progress > 100 ? 100 : row.progress" :format="progressFormat(row.progress)"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template v-slot="scope">
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleUpdate(scope.row)"
                       v-hasPermi="['warehouse:material:delete']"
            >详情
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['operations:overview:delete']"
            >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                  @pagination="getList"
      />
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
                     @change="bindDeviceChange"
          >
            <el-option v-for="(item, index) in deviceList" :key="index" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 2 && form.device" label="设备编号">
          <div>{{ form.code }}</div>
        </el-form-item>
        <!--项目管理类型-->
        <el-form-item v-if="form.type === 0" label="项目类型">
          <div>普通型(子任务设置无先后顺序)</div>
        </el-form-item>
        <!--生产管理类型-->
        <el-form-item v-if="form.type === 1" label="项目类型">
          <div>流程型(子任务顺序执行)</div>
        </el-form-item>
        <el-form-item label="标题" prop="name">
          <el-input v-model="form.name" placeholder="给目标起个名字"/>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <tree-select v-model="form.deptId" :options="deptOptions" :show-count="true" :clearable="false"
                      placeholder="请选择部门" :normalizer="normalizer" />
        </el-form-item>
        <el-form-item label="负责人" prop="blameId">
          <el-select v-model="form.blameId" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内部关注人" prop="followerIds">
          <el-select v-model="form.followerIds" style="width: 100%" filterable multiple placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.beginTime" type="date"
                          value-format="timestamp" placeholder="选择开始时间"
          />
        </el-form-item>
        <el-form-item label="任务周期" prop="period">
          <el-select v-model="form.period" placeholder="选择任务周期" clearable style="width: 100%">
            <el-option v-for="(item, index) in periodList" :key="index" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.endTime" type="date"
                          value-format="timestamp" placeholder="选择结束时间"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :rows="3" v-model="form.description" placeholder="请输入项目描述"/>
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
  getDevicePage
} from '@/api/config/device'
import {
  createOverview,
  updateOverview,
  deleteOverview,
  getOverview,
  getOverviewPage,
  exportOverviewExcel
} from '@/api/operations/overview'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { listSimpleUsers } from '@/api/system/user'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listSimpleDepts } from '@/api/system/dept'

export default {
  name: 'Overview',
  components: {
    DrawerPlus,
    TreeSelect
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
      // 部门树选项
      deptOptions: undefined,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 字段类型列表
      fieldTypeList: [
        { label: '项目名称', value: 1 },
        { label: '责任人', value: 2 },
        { label: '项目类型', value: 3 }
      ],
      // 项目类型列表
      typeList: getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_TYPE),
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
        createTime: [],
        fieldType: 1, // 字段类型
        status: 1, // 状态
        blameId: null, // 责任人
        name: null, // 项目名称 当类型是设备维保时，为设备编码
        type: null
      },
      // 表单参数
      form: {
        id: undefined,
        deptId: undefined, // 部门id
        type: undefined,
        name: undefined, // 项目名称
        device: undefined,
        code: undefined, // 设备编号
        blameId: undefined, // 责任人
        followerIds: [], // 内部关注人
        beginTime: undefined,
        period: undefined, // 任务周期
        endTime: undefined,
        description: undefined
      },
      // 表单校验
      rules: {
        type: [{ required: true, message: '项目类型不能为空', trigger: 'change' }],
        device: [{ required: true, message: '设备不能为空', trigger: 'change' }],
        name: [{ required: true, message: '项目标题不能为空', trigger: 'blur' }],
        deptId: [{ required: true, message: '部门不能为空', trigger: 'change' }],
        blameId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        followerIds: [{ required: true, message: '内部关注人不能为空', trigger: 'change' }],
        beginTime: [{ type: 'date', required: true, message: '请选择开始时间', trigger: 'change' }],
        period: [{ required: true, message: '请选择任务周期', trigger: 'change' }],
        endTime: [{ type: 'date', required: true, message: '请选择endTime', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
    this.getDeviceList()
    this.getTreeSelect()
  },
  watch: {
    // 监听选择开始时间、结束时间和任务周期
    // 如果form有id，说明是编辑，则根据开始时间(时间戳):beginTime和结束时间(时间戳):endTime计算任务周期(天数):period
    // 如果form没有id，说明是新增，则根据开始时间(时间戳):beginTime和任务周期(天数):period计算结束时间(时间戳):endTime
    'form.beginTime'() {
      const {id, beginTime, endTime, period} = this.form
      if (id) {
        this.form.period = Math.round((endTime - beginTime) / (24 * 60 * 60 * 1000));
      } else {
        this.form.endTime = new Date(beginTime + (period * 24 * 60 * 60 * 1000)).getTime();
      }
    },
    'form.endTime'() {
      const {id, beginTime, endTime} = this.form
      if (id) {
        this.form.period = Math.round((endTime - beginTime) / (24 * 60 * 60 * 1000));
      }
    },
    'form.period'() {
      const {id, beginTime, period} = this.form
      if (!id) {
        this.form.endTime = new Date(beginTime + (period * 24 * 60 * 60 * 1000)).getTime();
      }
    }
  },
  methods: {
    /** 查询部门下拉树结构 + 岗位下拉 */
    getTreeSelect() {
      listSimpleDepts().then(response => {
        // 处理 deptOptions 参数
        this.deptOptions = [];
        this.deptOptions.push(...this.handleTree(response.data, "id"));
      });
    },
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
      this.form.code = this.deviceList.find(item => item.id === val).code
    },
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
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
          item.type = this.typeList.find(type => parseInt(type.value) === item.type).label
          item.progress = parseFloat(((item.rate.current / item.rate.total) * 100).toFixed(2))
        })
        this.list = list
        this.total = total
        this.loading = false
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
        deptId: undefined, // 部门id
        type: undefined,
        device: undefined,
        code: undefined,
        name: undefined,
        blameId: undefined,
        followerIds: [], // 内部关注人
        beginTime: undefined,
        endTime: undefined,
        period: undefined, // 任务周期
        description: undefined
      }
      this.resetForm('form')
    },
    /** 文档/合同搜索 */
    handleSearch() {
      this.$router.push({
        path: '/operations/search'
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      getOverview(id).then(response => {
        const { data } = response
        data.blameId = data.blame.id
        data.followerIds = data.followers.map(item => item.id)
        data.deptId = data.dept.id
        this.form = data
        console.log(this.form)
        this.open = true
        this.title = '修改项目'
      })
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
      this.$modal.confirm('是否确认删除物料基础数据编号为"' + id + '"的数据项?').then(function() {
        return deleteOverview({ id })
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = { ...this.queryParams }
      params.pageNo = undefined
      params.pageSize = undefined
      this.$modal.confirm('是否确认导出所有物料基础数据数据项?').then(() => {
        this.exportLoading = true
        return exportOverviewExcel(params)
      }).then(response => {
        this.$download.excel(response, '物料基础数据.xls')
        this.exportLoading = false
      }).catch(() => {
      })
    },
    /** 格式化部门的下拉框 */
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    }
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
  font-size: 14px;
  font-weight: 600;
}
</style>
