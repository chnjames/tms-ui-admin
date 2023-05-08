<template>
  <div class="mission-container">
    <div class="search">
      <el-row type="flex" justify="end" align="middle">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-date-picker
            v-model="missionDate"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="daterange"
            align="right"
            style="width: 100%"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            @change="bindDateChange"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-col>
      </el-row>
    </div>
    <el-row>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <month-line-chart :taskQty="taskQty"/>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <staff-bar-chart :taskWorkTime="taskWorkTime"/>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <k-p-i-bar-chart :taskKpi="taskKpi"/>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <staff-line-chart :taskReceive="taskReceive"/>
          </div>
        </el-col>
      </el-row>
    </el-row>
  </div>
</template>

<script>
import MonthLineChart from '@/views/report/mission/MonthLineChart.vue'
import StaffBarChart from '@/views/report/mission/StaffBarChart.vue'
import KPIBarChart from '@/views/report/mission/KPIBarChart.vue'
import StaffLineChart from '@/views/report/mission/StaffLineChart.vue'
import {
  getTaskQty,
  getTaskReceive,
  getTaskWorkTime,
  getTaskKpi
} from '@/api/report/task'

export default {
  name: 'Mission',
  components: { StaffLineChart, MonthLineChart, StaffBarChart, KPIBarChart },
  data() {
    return {
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
      missionDate: null,
      taskQty: null, // 任务数
      taskReceive: null, // 任务领取数
      taskWorkTime: null, // 任务工时
      taskKpi: null // 任务KPI
    }
  },
  created() {
    this.getTaskQty()
    this.getTaskReceive()
    this.getTaskWorkTime()
    this.getTaskKpi()
  },
  methods: {
    /** 查询任务数(表1) */
    getTaskQty() {
      getTaskQty({ time: this.missionDate }).then(response => {
        this.taskQty = response.data
      });
    },
    /** 查询任务领取数(表2) */
    getTaskReceive() {
      getTaskReceive({ time: this.missionDate }).then(response => {
        this.taskReceive = response.data
      });
    },
    /** 查询任务工时(表3) */
    getTaskWorkTime() {
      getTaskWorkTime({ time: this.missionDate }).then(response => {
        this.taskWorkTime = response.data
      });
    },
    /** 查询任务KPI(表4) */
    getTaskKpi() {
      getTaskKpi({ time: this.missionDate }).then(response => {
        this.taskKpi = response.data
      });
    },
    /** 日期选择 */
    bindDateChange() {
      this.getTaskQty()
      this.getTaskReceive()
      this.getTaskWorkTime()
      this.getTaskKpi()
    }
  }
}
</script>

<style lang="scss" scoped>
.mission-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .search {
    background: #fff;
    padding: 16px;
    margin-bottom: 20px;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
