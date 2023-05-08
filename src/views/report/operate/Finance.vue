<template>
  <div>
    <el-row :gutter="20" type="flex" justify="space-between" align="middle">
      <el-col :xs="24" :sm="12" :lg="6">财务分析</el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-date-picker
          v-model="financeTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          align="right"
          unlink-panels
          style="width: 100%"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          @change="getFinanceAnalysis"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-col>
    </el-row>
    <el-divider/>
    <!-- 列表 -->
    <el-table v-loading="loading" :data="financeList" show-summary :summary-method="getSummaries">
      <el-table-column label="项目名称" align="center" prop="projectName"/>
      <el-table-column label="项目状态" align="center" prop="projectStatus">
        <template v-slot="{ row }">
          <el-tag size="mini" :type="row.statusColor">{{row.statusName}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单总金额(元)" width="140" sortable align="center" prop="paymentTotalAmount">
        <template v-slot="{ row }">
          <span>{{row.paymentTotalAmountDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="待收款金额(元)" width="140" sortable align="center" prop="paymentWaitAmount">
        <template v-slot="{ row }">
          <span>{{row.paymentWaitAmountDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料成本(元)" width="120" sortable align="center" prop="materialCost">
        <template v-slot="{ row }">
          <span>{{row.materialCostDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="委外成本(元)" align="center" prop="outsourcingCost">
        <template v-slot="{ row }">
          <span>{{row.outsourcingCostDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="耗费人力(人天)" align="center" prop="consumedWorkMinute"/>
      <el-table-column label="人力投入(元)" sortable align="center" prop="humanInputCost">
        <template v-slot="{ row }">
          <span>{{row.humanInputCostDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="盈亏(元)" sortable align="center" prop="profitAndLoss">
        <template v-slot="{ row }">
          <span>{{row.profitAndLossDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="利润率" sortable align="center" prop="profitRate">
        <template v-slot="{ row }">
          <span>{{row.profitRateDesc}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getFinanceAnalysis } from '@/api/report/operations'
import { formatMoney } from '@/utils'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'Finance',
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
      // 遮罩层
      loading: false,
      // 财务分析列表
      financeList: [],
      // 财务分析时间
      financeTime: null,
      // 项目状态列表
      statusList: this.getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_STATUS)
    }
  },
  created() {
    this.getFinanceAnalysis()
  },
  methods: {
    /** 获取财务分析 */
    getFinanceAnalysis() {
      this.loading = true
      getFinanceAnalysis({ time: this.financeTime }).then(response => {
        const {data} = response
        data.map(item => {
          item.statusName = this.statusList.find(i => parseInt(i.value) === item.projectStatus).label
          item.statusColor = this.statusList.find(i => parseInt(i.value) === item.projectStatus).colorType
          item.paymentTotalAmountDesc = formatMoney(item.paymentTotalAmount / 100 ?? 0)
          item.paymentWaitAmountDesc = formatMoney(item.paymentWaitAmount / 100 ?? 0)
          item.materialCostDesc = formatMoney(item.materialCost / 100 ?? 0)
          item.outsourcingCostDesc = formatMoney(item.outsourcingCost / 100 ?? 0)
          item.consumedWorkMinute = item.consumedWorkMinute / 60
          item.humanInputCostDesc = formatMoney(item.humanInputCost / 100 ?? 0)
          item.profitAndLossDesc = formatMoney(item.profitAndLoss / 100 ?? 0)
          item.profitRateDesc = item.profitRate + '%'
        })
        this.financeList = data
        this.loading = false
      })
    },
    /** 合计 */
    getSummaries(param) {
      const { columns, data } = param;
      // 计算合计
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (column.property === 'profitRate') {
          sums[index] = data.reduce((prev, curr) => {
            const value = Number(curr[column.property]);
            if (!isNaN(value)) {
              return prev + curr[column.property];
            } else {
              return prev;
            }
          }, 0) + '%';
        } else if (column.property === 'projectStatus') {
          sums[index] = '';
        } else {
          sums[index] = data.reduce((prev, curr) => {
            const value = Number(curr[column.property]);
            if (!isNaN(value)) {
              return prev + curr[column.property];
            } else {
              return prev;
            }
          }, 0);
          sums[index] = formatMoney(sums[index] / 100);
        }
      });
      return sums;
    }
  }
}
</script>

<style lang="scss" scoped>
.el-divider--horizontal {
  margin: 16px 0;
}
</style>
