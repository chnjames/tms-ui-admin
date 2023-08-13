<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="20">
        <!-- 搜索工作栏 -->
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item prop="createTime">
            <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd"
                            type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable @keyup.enter.native="handleQuery"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
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
          <template v-if="item.prop === 'progress'">
            <el-progress :percentage="row.rate > 100 ? 100 : row.rate" :color="row.progressColor" :format="progressFormat(row.rate)"></el-progress>
          </template>
          <template v-else-if="item.prop === 'status'">
            <el-tag size="mini" :type="row.statusColor">{{row.statusDesc}}</el-tag>
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import { getProjectSimpleList, getTaskPage } from '@/api/operations/overview'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import DragFileUpload from '@/components/DragFileUpload/index.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: "Mine",
  components: {
    DragFileUpload,
    DrawerPlus
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 任务总览列表
      list: [],
      // tabs列表
      tabList: getDictDatas(DICT_TYPE.OPERATIONS_TASK_STATUS),
      // 任务类型列表
      taskTypeList: getDictDatas(DICT_TYPE.OPERATIONS_TASK_TYPE),
      // 项目列表
      projectSimpleList: [],
      // 基础表头
      tableHeader: [
        { prop: 'proName', label: '项目名称' },
        { prop: 'name', label: '任务名称' },
        { prop: 'activatedTime', label: '计划开始' },
        { prop: 'endTime', label: '计划结束' },
        { prop: 'completedTime', label: '实际结束' },
        { prop: 'progress', label: '任务进度' },
        { prop: 'status', label: '任务状态' },
        { prop: 'blameName', label: '执行人' }
      ],
      // 查询参数
      queryParams: {
        name: null,
        status: 'all',
        pageNo: 1,
        pageSize: 10
      }
    };
  },
  computed: {
    tabsList() {
      return [
        { value: 'all', label: '全部' },
        ...this.tabList
      ]
    }
  },
  created() {
    this.getProjectSimpleList();
    this.getList();
  },
  methods: {
    /** 获取项目精简信息列表 */
    getProjectSimpleList() {
      getProjectSimpleList().then(response => {
        this.projectSimpleList = response.data;
      });
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
          if (item.projectId) {
            item.proName = this.projectSimpleList.find(i => i.id === item.projectId)?.name || ''
          } else {
            item.proName = this.taskTypeList.find(i => parseInt(i.value) === item.type)?.label || ''
          }
          item.activatedTime = parseTime(item.activatedTime)
          item.endTime = parseTime(item.endTime)
          item.completedTime = parseTime(item.completedTime)
          item.statusDesc = this.tabList.find(i => parseInt(i.value) === item.status).label
          item.statusColor = this.tabList.find(i => parseInt(i.value) === item.status).colorType
          if (item.rate < 100) {
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
        this.list = list;
        this.total = total;
        this.loading = false;
      });
    },
    /** 进度条格式化 */
    progressFormat(progress) {
      return () => {
        return `${progress}%`
      }
    },
    /* 切换状态 */
    bindTab(tab) {
      this.queryParams.status = tab.name
      this.getList()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    }
  }
};
</script>
