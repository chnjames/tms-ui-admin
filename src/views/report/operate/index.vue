<template>
  <div class="app-container">
    <el-row type="flex" justify="space-between" class="mb20">
      <el-col :span="4">
        <el-card>
          <div slot="header">
            <span>近1月采购支出</span>
            <el-button style="float: right; padding: 3px 0" plain type="text">查看详情</el-button>
          </div>
          <div class="card-layout">
            <div class="icon expenditure">
              <i class="el-icon-upload2"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div slot="header">
            <span>近1月销售收入</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看详情</el-button>
          </div>
          <div class="card-layout">
            <div class="icon income">
              <i class="el-icon-download"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div slot="header">
            <span>当前应收账款</span>
          </div>
          <div class="card-layout">
            <div class="icon receivable">
              <i class="el-icon-wallet"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div slot="header">
            <span>延期未收款金额</span>
          </div>
          <div class="card-layout">
            <div class="icon extension">
              <i class="el-icon-money"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div slot="header">
            <span>资产存货价值</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看详情</el-button>
          </div>
          <div class="card-layout">
            <div class="icon">
              <i class="el-icon-coin"></i>
            </div>
            <count-to :start-val="0" :end-val="81212" :duration="3000" class="card-panel-num" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="mb20">
      <div slot="header" style="padding-bottom: 10px">
        <span style="font-size: 18px;">财务分析</span>
        <el-date-picker
          style="float: right;"
          size="mini"
          v-model="financeTime"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions">
        </el-date-picker>
      </div>
      <!-- 列表 -->
      <el-table v-loading="loading" :data="list" show-summary>
        <el-table-column label="项目名称" align="center" prop="name" />
        <el-table-column label="项目状态" align="center" prop="address" />
        <el-table-column label="订单总金额(元)" sortable align="center" prop="contactName" />
        <el-table-column label="待收款金额(元)" sortable align="center" prop="contactMobile" />
        <el-table-column label="物料成本(元)" sortable align="center" prop="email" />
        <el-table-column label="委外成本(元)" align="center" prop="email" />
        <el-table-column label="耗费人力(人天)" align="center" prop="email" />
        <el-table-column label="人力投入(元)" sortable align="center" prop="email" />
        <el-table-column label="盈亏(元)" sortable align="center" prop="email" />
        <el-table-column label="利润率" sortable align="center" prop="email" />
      </el-table>
    </el-card>
    <el-row :gutter="10" class="mb20">
      <el-col :xs="24" :sm="24" :lg="12">
        <el-card>
          <line-chart height="400px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <el-card>
          <bar-chart height="400px" />
        </el-card>
      </el-col>
    </el-row>
    <el-card>
      <div slot="header" style="padding-bottom: 35px">
        <div style="float: right;">
          <el-date-picker
            class="mr20"
            size="mini"
            v-model="financeTime"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions">
          </el-date-picker>
          <el-select v-model="financeTime" placeholder="请选择项目" size="mini">
            <el-option v-for="item in 5" :key="item" :label="'项目'+item" :value="item" />
          </el-select>
        </div>
      </div>
      <gantt-task />
    </el-card>
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
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      // 财务分析时间
      financeTime: '',
      // 遮罩层
      loading: false,
      // 财务分析列表
      list: [],
    }
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
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
.chart-wrapper {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 32px;
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
