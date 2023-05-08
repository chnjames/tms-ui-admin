<template>
  <div class="warpper">
    <el-row :gutter="20" type="flex" justify="end" align="middle">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-date-picker
          v-model="queryParams.time"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          align="right"
          style="width: 100%"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          @change="getTaskGantt"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-select v-model="queryParams.projectId" clearable placeholder="请选择项目" @change="getTaskGantt" style="width: 100%">
          <el-option v-for="item in projectSimpleList" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
      </el-col>
    </el-row>
    <el-divider/>
    <div ref="gantt" v-loading="loading" class="gantt-container"/>
  </div>
</template>

<script>
import gantt from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import { parseTime } from '@/utils/ruoyi'
import { getProjectSimpleList } from '@/api/operations/overview'
import { getTaskGantt } from '@/api/report/operations'

export default {
  name: 'GanttTask',
  data() {
    return {
      // 查询参数
      queryParams: {
        projectId: null,
        time: null
      },
      // 加载中
      loading: false,
      projectSimpleList: [], // 项目列表
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一年',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      // 甘特图配置
      tasks: {
        data: [{
          id: 11, // 任务标识
          text: '任务1', // 文本，任务的显示文字
          start_date: '18-04-2018', // 开始时间
          end_date: '19-04-2018', // 结束时间
          type: gantt.config.types.task, // 任务类型，有三种，object，task，milestone
          progress: 1 // 项目的进度，用颜色深浅显示
        }]
      }
    }
  },
  async created() {
    const [projectListData] = await Promise.all([getProjectSimpleList()])
    this.projectSimpleList = projectListData.data
    await this.getTaskGantt()
  },
  methods: {
    /** 获取甘特图数据 */
    getTaskGantt() {
      this.loading = true
      getTaskGantt(this.queryParams).then(response => {
        const {data} = response
        const filterData = data.filter(item => item.projectId)
        filterData.map(item => {
          item.text = item.name
          item.type = gantt.config.types.task
          item.start_date = item.activatedTime ? parseTime(new Date(item.activatedTime), '{d}-{m}-{y} {h}:{i}:{s}') : parseTime(new Date(), '{d}-{m}-{y} {h}:{i}:{s}')
          item.end_date = item.completedTime ? parseTime(new Date(item.completedTime), '{d}-{m}-{y} {h}:{i}:{s}') : parseTime(new Date(), '{d}-{m}-{y} {h}:{i}:{s}')
        })
        this.tasks.data = filterData
        this.init()
        this.loading = false
      });
    },
    // 初始化
    init() {
      // 自动延长时间刻度
      gantt.config.fit_tasks = true
      // 允许拖放
      gantt.config.drag_project = true
      //甘特图右侧表头的高度
      gantt.config.scale_height = 80
      // 甘特图的行高
      gantt.config.row_height = 60
      //task高度
      gantt.config.bar_height = 40
      // 设置滚动条宽/高度
      // gantt.config.scroll_size = 10
      //使用中文
      gantt.i18n.setLocale('cn')
      //自适应甘特图的尺寸大小, 使得在不出现滚动条的情况下, 显示全部任务
      gantt.config.autosize = true
      //只读模式
      gantt.config.readonly = true
      //是否显示左侧树表格
      gantt.config.show_grid = true
      // 拖拽调整行高
      gantt.config.resize_rows = false
      // 调整网格宽
      gantt.config.grid_resize = true
      // 调整网格内列宽
      gantt.config.grid_elastic_columns = true
      //时间轴图表中，如果不设置，只有行边框，区分上下的任务，设置之后带有列的边框，整个时间轴变成格子状
      gantt.config.show_task_cells = false
      // 是否显示错误
      gantt.config.show_errors = false
      // 表头可排序
      // gantt.config.sort = true
      // 任务条上弹出提示框
      gantt.plugins({
        tooltip: true
      })
      // 自定义提示框的内容
      gantt.templates.tooltip_text = function(start, end, task) {
        return `<div>
          <div>任务：${task.text}</div>
          <div>开始时间：${parseTime(task.start_date, '{y}-{m}-{d} {h}:{i}:{s}')}</div>
          <div>结束时间：${parseTime(task.end_date, '{y}-{m}-{d} {h}:{i}:{s}')}</div>
          <div>进度：${task.progress * 100}%</div>
        </div>`
      }
      // 时间线任务条样式自定义
      gantt.templates.task_class = function(start, end, task) {
        // task.state值为default/unfinished/finished/canceled其中一种
        // console.log(task.type, task.colorType, task.status, task.parent)
        return `gantt_${task.type}`
      }
      // 日期网格配置
      gantt.templates.date_grid = function(date, task, column) {
        // console.log('日期网格', date, task, column)
        if (task && gantt.isUnscheduled(task) && gantt.config.show_unscheduled) {
          return gantt.templates.task_unscheduled_time(task)
        } else {
          return gantt.templates.grid_date_format(date)
        }
      }

      // 突出周末颜色
      gantt.templates.timeline_cell_class = function(item, date) {
        // console.log(item, date)
        if (date.getDay() === 0 || date.getDay() === 6) {
          return 'weekend'
        }
      }
      // 配置任务内部显示元素
      gantt.templates.task_text = function(start, end, task) {
        return `${task.text}`
      }
      // 控制网格区域的样式（类名）
      // gantt.templates.grid_row_class = function (start, end, task) {
      //   console.log("网格class", start, end, task);
      // };
      // 定义时间格式
      gantt.config.scales = [
        { unit: 'month', step: 1, date: '%F, %Y' },
        { unit: 'day', step: 1, date: '%j, %D' }
      ]
      //表格列设置
      gantt.config.columns = [
        { name: 'text', label: '任务内容', width: '120', align: 'center' }
      ]
      // 添加弹窗属性
      gantt.config.lightbox.sections = [
        {
          name: 'description',
          height: 70,
          map_to: 'text',
          type: 'textarea',
          focus: true
        },
        { name: 'type', type: 'typeselect', map_to: 'type' },
        { name: 'time', type: 'duration', map_to: 'auto' }
      ]
      // 初始化
      gantt.init(this.$refs.gantt)
      // 清除数据
      gantt.clearAll()
      // 数据解析
      gantt.parse(this.tasks)
    }
  }
}
</script>

<style lang="scss">
.gantt_task {
  border: none;
  background: #79bbff;
}
.gantt_task_row.gantt_selected {
  background: #f0f3f9;
}
.gantt_grid_data .gantt_row.gantt_selected {
  background: #f0f3f9;
}
.gantt_grid_data .gantt_row.odd.gantt_selected {
  background: #f0f3f9;
}
.gantt_grid_data .gantt_row.odd:hover, .gantt_grid_data .gantt_row:hover {
  background: #f0f3f9;
}
.gantt_task .gantt_task_progress {
  background: #53a8ff;
}
.gantt_task.gantt_selected {
  background: #53a8ff;
}
</style>
