<template>
  <div class="operate-container">
    <el-row :gutter="20" justify="space-between">
      <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
        <el-card class="mb20" shadow="never">
          <div slot="header">
            <span>近1月采购支出</span>
            <el-button style="float: right; padding: 3px 0" plain type="text" @click="handleDetails">查看详情
            </el-button>
          </div>
          <div class="card-layout">
            <div class="icon expenditure">
              <i class="el-icon-upload2"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num"/>
          </div>
        </el-card>
      </el-col>
      <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
        <el-card class="mb20" shadow="never">
          <div slot="header">
            <span>近1月销售收入</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看详情</el-button>
          </div>
          <div class="card-layout">
            <div class="icon income">
              <i class="el-icon-download"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num"/>
          </div>
        </el-card>
      </el-col>
      <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
        <el-card class="mb20" shadow="never">
          <div slot="header">
            <span>当前应收账款</span>
          </div>
          <div class="card-layout">
            <div class="icon receivable">
              <i class="el-icon-wallet"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num"/>
          </div>
        </el-card>
      </el-col>
      <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
        <el-card class="mb20" shadow="never">
          <div slot="header">
            <span>延期未收款金额</span>
          </div>
          <div class="card-layout">
            <div class="icon extension">
              <i class="el-icon-money"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num"/>
          </div>
        </el-card>
      </el-col>
      <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
        <el-card class="mb20" shadow="never">
          <div slot="header">
            <span>资产存货价值</span>
            <el-button style="float: right; padding: 3px 0" plain type="text">查看详情</el-button>
          </div>
          <div class="card-layout">
            <div class="icon expenditure">
              <i class="el-icon-upload2"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="card">
      <el-row :gutter="20" type="flex" justify="space-between" align="middle">
        <el-col :xs="24" :sm="12" :lg="6">财务分析</el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-date-picker
            v-model="financeTime"
            value-format="yyyy-MM-dd"
            type="daterange"
            align="right"
            unlink-panels
            style="width: 100%"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-col>
      </el-row>
      <el-divider/>
      <!-- 列表 -->
      <el-table v-loading="loading" :data="list" show-summary>
        <el-table-column label="项目名称" align="center" prop="name"/>
        <el-table-column label="项目状态" align="center" prop="address"/>
        <el-table-column label="订单总金额(元)" width="140" sortable align="center" prop="contactName"/>
        <el-table-column label="待收款金额(元)" width="140" sortable align="center" prop="contactMobile"/>
        <el-table-column label="物料成本(元)" width="120" sortable align="center" prop="email"/>
        <el-table-column label="委外成本(元)" align="center" prop="email"/>
        <el-table-column label="耗费人力(人天)" align="center" prop="email"/>
        <el-table-column label="人力投入(元)" sortable align="center" prop="email"/>
        <el-table-column label="盈亏(元)" sortable align="center" prop="email"/>
        <el-table-column label="利润率" sortable align="center" prop="email"/>
      </el-table>
    </div>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <line-chart height="400px"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart height="400px"/>
        </div>
      </el-col>
    </el-row>
    <div class="card">
      <el-row :gutter="20" type="flex" justify="end" align="middle">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-date-picker
            v-model="financeTime"
            value-format="yyyy-MM-dd"
            type="daterange"
            align="right"
            style="width: 100%"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-select v-model="financeTime" placeholder="请选择项目" style="width: 100%">
            <el-option v-for="item in 5" :key="item" :label="'项目'+item" :value="item"/>
          </el-select>
        </el-col>
      </el-row>
      <el-divider/>
      <gantt-task/>
    </div>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import BarChart from './BarChart.vue'
import LineChart from './LineChart.vue'
import GanttTask from '@/views/report/operate/GanttTask.vue'

export default {
  name: 'Operate',
  components: {
    GanttTask,
    CountTo,
    BarChart,
    LineChart
  },
  data() {
    return {
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一年',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      // 财务分析时间
      financeTime: '',
      // 遮罩层
      loading: false,
      // 财务分析列表
      list: []
    }
  },
  methods: {
    handleDetails() {
      this.$router.push({
        path: "/report/overview",
        query: {
          type: 1
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.operate-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  position: relative;
}

.card-panel-num {
  font-size: 24px;
}

.card-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: #00afff;
  color: #FFFFFF;
  border-radius: 50%;
  font-size: 24px;
}

.expenditure {
  background-color: #E6A23C;
}

.income {
  background-color: #67C23A;
}

.receivable {
  background-color: #909399;
}

.extension {
  background-color: #F56C6C;
}

.card {
  background: #fff;
  padding: 16px;
  margin-bottom: 20px;
}

.chart-wrapper {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

@media only screen and (min-width: 1200px) {
  .el-col-lg-5 {
    width: 20%;
  }
}

.el-divider--horizontal {
  margin: 16px 0;
}
</style>
