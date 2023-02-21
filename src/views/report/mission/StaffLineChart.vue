<template>
  <charts :options="options" height="400px" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'
export default {
  name: 'StaffLineChart',
  components: { Charts },
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
          data: ['总数量', '主动领取数量', '被指派数量']
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
            name: '总数量',
            type: 'line',
            smooth: false,
            data: [12, 56, 23, 63, 93, 47, 73, 23, 56, 56, 18, 43]
          }, {
            name: '主动领取数量',
            type: 'line',
            smooth: false,
            data: [8, 48, 20, 58, 79, 16, 52, 21, 49, 43, 17, 21]
          }, {
            name: '被指派数量',
            type: 'line',
            smooth: false,
            data: [4, 8, 3, 5, 14, 31, 21, 2, 7, 13, 1, 22]
          }
        ]
      }
    }
  },
}
</script>
