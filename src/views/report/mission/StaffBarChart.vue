<template>
  <charts ref="staffBar" :options="options" height="400px" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'
import { listSimpleUsers } from '@/api/system/user'

export default {
  name: 'StaffBarChart',
  components: { Charts },
  props: {
    taskWorkTime: {
      type: Object,
      default: () => {}
    }
  },
  async created() {
    await this.getUserList();
  },
  watch: {
    taskWorkTime: {
      async handler(val) {
        const isUserListExist = await this.getUserList();
        if (isUserListExist) {
          const { blameIds, consumedWorkMinute, plannedWorkMinute } = val
          const blameNames = blameIds.map(id => this.userList.find(user => user.id === id)?.nickname || '')
          this.$nextTick(()=>{
            this.$refs.staffBar.chart.setOption({
              xAxis: {
                data: blameNames
              },
              series: [
                {
                  data: plannedWorkMinute
                }, {
                  data: consumedWorkMinute
                }
              ]
            })
          })
        }
      },
      deep: true
    }
  },
  data() {
    return {
      options: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        title: {
          text: '按人员统计',
          textAlign: 'left',
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal',
            color: '#333'
          }
        },
        color: ['#409EFF', '#67C23A'],
        legend: {
          left: 'center',
          bottom: 10,
          data: ['已分派工时', '已完成工时']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '10%',
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
          }
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
            name: '已分派工时',
            type: 'bar',
            barWidth: '30%',
            barGap: 0 // 表示柱子之间的距离
          }, {
            name: '已完成工时',
            type: 'bar',
            barWidth: '30%',
            barGap: 0 // 表示柱子之间的距离
          }
        ]
      },
      userList: [] // 用户列表
    }
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      return new Promise((resolve, reject) => {
        listSimpleUsers().then(response => {
          this.userList = response.data
          resolve(true);
        }).catch(error => {
          reject(error);
        })
      })
    },
  }
}
</script>
