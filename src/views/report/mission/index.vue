<template>
  <div class="mission-container">
    <div class="search">
      <el-row type="flex" justify="end" align="middle">
        <!--自定义实现：快捷日期选择：本周(本周一0点 ~ 当前时间)、本月(本月1号0点 ~  当前时间)、本年(今年1月1日0点 ~ 当前时间) 并排排列-->
        <div class="custom">
          <div v-for="(item, index) in customItems" :key="index"
               :class="{ 'custom-item': true, 'active': activeItemIndex === index }"
               @click="bindDateCustomChange(index, item.value)">
            {{ item.label }}
          </div>
        </div>
        <el-col :xs="12" :sm="6" :lg="5">
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
            @change="bindDateChange">
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
      customItems: [
        { label: '本周', value: 'week' },
        { label: '本月', value: 'month' },
        { label: '本年', value: 'year' }
      ],
      activeItemIndex: null,
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
    },
    /** 自定义快捷日期选择 */
    bindDateCustomChange(index, type) {
      // 选中的状态下，再次点击，取消选中
      if (this.activeItemIndex === index) {
        this.activeItemIndex = null;
        this.missionDate = null;
        this.bindDateChange();
        return;
      }
      this.activeItemIndex = index;
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      let endDate = new Date(currentDate);
      if (type === 'week') {
        // 周一到周日
        const day = currentDate.getDay();
        if (day === 0) {
          startDate.setDate(currentDate.getDate() - 6);
        } else {
          startDate.setDate(currentDate.getDate() - day + 1);
        }
      } else if (type === 'month') {
        startDate.setDate(1);
      } else if (type === 'year') {
        startDate.setMonth(0, 1);
      }
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      this.missionDate = [formattedStartDate, formattedEndDate];
      this.getTaskQty();
      this.getTaskReceive();
      this.getTaskWorkTime();
      this.getTaskKpi();
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
// 自定义快捷日期
.custom {
  display: flex;
  align-content: center;
  &-item {
    margin-right: 15px;
    cursor: pointer;
    color: #5a5a5a;
    &.active {
      color: #66b1ff;
    }
    &:hover {
      color: #66b1ff;
    }
  }
}
</style>
