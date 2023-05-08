<template>
  <charts ref="KPIBar" :options="options" height="400px"/>
</template>

<script>
import Charts from '@/components/Charts/index.vue'
import { listSimpleUsers } from '@/api/system/user'

export default {
  name: 'KPIBarChart',
  components: { Charts },
  props: {
    taskKpi: {
      type: Object,
      default: () => {}
    }
  },
  async created() {
    await this.getUserList();
  },
  watch: {
    taskKpi: {
      async handler(val) {
        const isUserListExist = await this.getUserList();
        if (isUserListExist) {
          const { blameIds, kpi } = val
          const blameNames = blameIds.map(id => this.userList.find(user => user.id === id)?.nickname || '')
          this.$nextTick(()=>{
            this.$refs.KPIBar.chart.setOption({
              xAxis: {
                data: blameNames
              },
              series: [
                {
                  data: kpi
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
          },
          formatter: function (params) {
            const [kpi] = params
            return 'KPI: ' + kpi.value;
          }
        },
        title: {
          text: 'KPI',
          textAlign: 'left',
          textStyle: {
            color: '#666',
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        color: ['#409EFF'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '10%',
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
            }
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
            barWidth: '60%'
          }
        ]
      }
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
