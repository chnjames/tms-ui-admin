<template>
  <charts ref="LineChart" :options="options" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'
export default {
  name: 'LineChart',
  components: { Charts },
  props: {
    salesAndArrears: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    salesAndArrears: {
      handler(val) {
        let { customerOwe, projectIncome } = val
        customerOwe = customerOwe.map(item => item / 100 || null)
        projectIncome = projectIncome.map(item => item / 100 || null)
        this.$nextTick(()=>{
          this.$refs.LineChart.chart.setOption({
            series: [
              {
                data: projectIncome
              }, {
                data: customerOwe
              }
            ]
          })
        })
      },
      deep: true
    }
  },
  data() {
    return {
      options: {
        tooltip: {
          trigger: 'axis'
        },
        color: ['#409EFF', '#67C23A'],
        legend: {
          left: 'center',
          bottom: '10',
          data: ['销售收入', '客户欠款']
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
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisTick: {
            alignWithLabel: true
          },
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color:'#abb8ce',
          },
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
            name: '销售收入',
            type: 'line',
            smooth: false
          }, {
            name: '客户欠款',
            type: 'line',
            smooth: false
          }
        ]
      }
    }
  },
}
</script>
