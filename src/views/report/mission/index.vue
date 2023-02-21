<template>
  <div class="mission-container">
    <el-row>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <month-line-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <staff-bar-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <k-p-i-bar-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-wrapper">
            <staff-line-chart />
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

export default {
  name: 'Mission',
  components: { StaffLineChart, MonthLineChart, StaffBarChart, KPIBarChart }
}
</script>

<style lang="scss" scoped>
.mission-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  position: relative;

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
