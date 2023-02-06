<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  name: 'BarChart',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['物料采购', '资产存货']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '3%',
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
      })
    }
  }
}
</script>

<style scoped>

</style>
