<template>
  <charts ref="monthLine" :options="options" height="400px" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'
export default {
  name: 'MonthLineChart',
  components: { Charts },
  props: {
    taskQty: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    taskQty: {
      handler(val) {
        let { totalQty, finishQty, unFinishQty } = val
        totalQty = totalQty.map(item => item || null)
        finishQty = finishQty.map(item => item || null)
        unFinishQty = unFinishQty.map(item => item || null)
        this.$nextTick(()=>{
          this.$refs.monthLine.chart.setOption({
            series: [
              {
                data: totalQty
              }, {
                data: finishQty
              }, {
                data: unFinishQty
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
        color: ['#409EFF', '#67C23A', '#E6A23C'],
        legend: {
          left: 'center',
          bottom: 10,
          data: ['总任务数量', '已完成数量', '未完成数量']
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
            name: '总任务数量',
            type: 'line',
            smooth: false
          }, {
            name: '已完成数量',
            type: 'line',
            smooth: false
          }, {
            name: '未完成数量',
            type: 'line',
            smooth: false
          }
        ]
      }
    }
  }
}
</script>
