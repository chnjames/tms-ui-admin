<template>
  <charts ref="staffLine" :options="options" height="400px" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'
import { listSimpleUsers } from '@/api/system/user'
export default {
  name: 'StaffLineChart',
  components: { Charts },
  props: {
    taskReceive: {
      type: Object,
      default: () => {}
    },
  },
  async created() {
    await this.getUserList();
  },
  watch: {
    taskReceive: {
      async handler(val) {
        const isUserListExist = await this.getUserList();
        if (isUserListExist) {
          const {active, blameIds, passive, total } = val
          const blameNames = blameIds.map(id => this.userList.find(user => user.id === id)?.nickname || '')
          this.$nextTick(()=>{
            this.$refs.staffLine.chart.setOption({
              xAxis: {
                data: blameNames
              },
              series: [
                {
                  data: total
                }, {
                  data: active
                }, {
                  data: passive
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
          trigger: 'axis'
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
            smooth: false
          }, {
            name: '主动领取数量',
            type: 'line',
            smooth: false
          }, {
            name: '被指派数量',
            type: 'line',
            smooth: false
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
    }
  }
}
</script>
