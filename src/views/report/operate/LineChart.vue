<template>
  <charts :options="options" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'
export default {
  name: 'LineChart',
  components: { Charts },
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
            smooth: false,
            data: [7, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
          }, {
            name: '客户欠款',
            type: 'line',
            smooth: false,
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17, 16.6, 14.2, 10.3, 6.6, 4.8]
          }
        ]
      }
    }
  },
}
</script>
