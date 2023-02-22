<template>
  <charts :options="options" height="400px" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'

export default {
  name: 'StaffBarChart',
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
        color: ['#409EFF', '#67C23A'],
        legend: {
          left: 'center',
          bottom: 10,
          data: ['任务数量', '工时数量']
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
          data: ['Floppy', 'Jill', 'Chen', 'Eric', 'Linda', 'Li', 'ChenYL', 'LiuYIN', 'Qu', 'Fish']
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
            color:'#abb8ce'
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
            name: '任务数量',
            type: 'bar',
            barWidth: '30%',
            barGap: 0, // 表示柱子之间的距离
            data: [7, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3]
          }, {
            name: '工时数量',
            type: 'bar',
            barWidth: '30%',
            barGap: 0, // 表示柱子之间的距离
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17, 16.6, 14.2, 10.3]
          }
        ]
      }
    }
  }
}
</script>
