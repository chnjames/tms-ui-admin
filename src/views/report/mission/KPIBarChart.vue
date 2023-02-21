<template>
  <charts :options="options" height="400px"/>
</template>

<script>
import Charts from '@/components/Charts/index.vue'

export default {
  name: 'BaseBarChart',
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
        color: ['#409EFF'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            },
            axisTick: {
              alignWithLabel: true
            },
            data: ['Floppy', 'Jill', 'Chen', 'Eric', 'Linda', 'Li', 'ChenYL', 'LiuYIN', 'Qu', 'Fish']
          }
        ],
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#abb8ce'
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
            type: 'bar',
            barWidth: '60%',
            data: [7, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3]
          }
        ]
      }
    }
  }
}
</script>
