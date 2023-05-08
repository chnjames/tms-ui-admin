<template>
  <div class="operate-container">
    <panel />
    <div class="card">
      <finance />
    </div>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <line-chart height="400px"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart height="400px"/>
        </div>
      </el-col>
    </el-row>
    <div class="card">
      <gantt-task/>
    </div>
  </div>
</template>

<script>
import Finance from '@/views/report/operate/Finance.vue'
import BarChart from '@/views/report/operate/BarChart.vue'
import LineChart from '@/views/report/operate/LineChart.vue'
import GanttTask from '@/views/report/operate/GanttTask.vue'
import Panel from '@/views/report/operate/Panel.vue'

export default {
  name: 'Operate',
  components: {
    Panel,
    Finance,
    GanttTask,
    BarChart,
    LineChart
  }
}
</script>

<style lang="scss" scoped>
.operate-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
}

.card {
  background: #fff;
  padding: 16px;
  margin-bottom: 20px;
}

.chart-wrapper {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 20px;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
