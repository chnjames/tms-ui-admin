<template>
  <charts :options="options" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'

export default {
  name: 'BarChart',
  components: { Charts },
  data() {
    return {
      options: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          left: 'center',
          bottom: 0,
          data: ['物料采购', '资产存货']
        },
        grid: {
          top: 10,
          left: '2%',
          right: '2%',
          bottom: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: ['#eee']
            }
          },
          splitArea: {
            show: false
          }
        },
        series: [
          {
            name: '物料采购',
            type: 'bar',
            barWidth: '30%',
            data: [1258470.00, 1258470.00, 1573486.00, 1258412.00, 1258465.00, 1258621.00, 1258841.00, 1258001.00, 1258105.00, 1254095.00, 1258801.00, 1258201.00]
          }, {
            name: '资产存货',
            type: 'bar',
            barWidth: '30%',
            data: [1228470.00, 1248570.00, 1116511.20, 1228450.00, 1228640.00, 1225470.00, 1222570.00, 1228630.00, 1220200.00, 1266670.00, 1228900.00, 1228942.00]
          }
        ]
      }
    }
  }
}
</script>
