<template>
  <charts ref="barChart" :options="options" />
</template>

<script>
import Charts from '@/components/Charts/index.vue'
import { getPurchaseAndStock } from '@/api/report/operations'

export default {
  name: 'BarChart',
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
          bottom: 0,
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
            name: '物料采购',
            type: 'bar',
            barWidth: '30%',
            barGap: 0 // 表示柱子之间的距离
          }, {
            name: '资产存货',
            type: 'bar',
            barWidth: '30%',
            barGap: 0 // 表示柱子之间的距离
          }
        ]
      }
    }
  },
  created() {
    this.getPurchaseAndStock()
  },
  methods: {
    /** 获取采购支出和库存 */
    getPurchaseAndStock() {
      getPurchaseAndStock().then(response => {
        const {data} = response
        let { buyingQty, stockQty } = data
        buyingQty = buyingQty.map(item => item || null)
        stockQty = stockQty.map(item => item || null)
        this.$nextTick(()=>{
          this.$refs.barChart.chart.setOption({
            series: [{
              data: buyingQty
            }, {
              data: stockQty
            }]
          })
        })
      })
    }
  }
}
</script>
