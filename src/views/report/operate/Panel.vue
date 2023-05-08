<template>
  <el-row :gutter="20" justify="space-between">
    <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
      <el-card class="mb20" shadow="never">
        <div slot="header">
          <span>近1月采购支出</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="handleDetails('purchase')">查看详情</el-button>
        </div>
        <div class="card-layout">
          <div class="icon expenditure">
            <i class="el-icon-upload2"></i>
          </div>
          <count-to :start-val="0" :end-val="lastMonthMaterialBuyingPay" :duration="3000" class="card-panel-num"/>
        </div>
      </el-card>
    </el-col>
    <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
      <el-card class="mb20" shadow="never">
        <div slot="header">
          <span>近1月销售收入</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="handleDetails('market')">查看详情</el-button>
        </div>
        <div class="card-layout">
          <div class="icon income">
            <i class="el-icon-download"></i>
          </div>
          <count-to :start-val="0" :end-val="lastMonthProjectPaymentIncome" :duration="3000" class="card-panel-num"/>
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
          <count-to :start-val="0" :end-val="projectPaymentNeed" :duration="3000" class="card-panel-num"/>
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
          <count-to :start-val="0" :end-val="projectPaymentTimeout" :duration="3000" class="card-panel-num"/>
        </div>
      </el-card>
    </el-col>
    <el-col :xl="5" :lg="5" :md="12" :sm="12" :xs="24">
      <el-card class="mb20" shadow="never">
        <div slot="header">
          <span>资产存货价值</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="handleDetails('stock')">查看详情</el-button>
        </div>
        <div class="card-layout">
          <div class="icon expenditure">
            <i class="el-icon-upload2"></i>
          </div>
          <count-to :start-val="0" :end-val="stockValve" :duration="3000" class="card-panel-num"/>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { getFinanceOverview } from '@/api/report/operations'

export default {
  name: 'Panel',
  components: {
    CountTo
  },
  data() {
    return {
      lastMonthMaterialBuyingPay: 0, // 上月物料采购付款
      lastMonthProjectPaymentIncome: 0, // 上月项目收款
      projectPaymentNeed: 0, // 项目收款需求
      projectPaymentTimeout: 0, // 项目收款逾期
      stockValve: 0, // 库存阀值
    }
  },
  created() {
    this.getFinanceOverview()
  },
  methods: {
    /** 获取财务概览 */
    getFinanceOverview() {
      getFinanceOverview().then(response => {
        const {
          lastMonthMaterialBuyingPay,
          lastMonthProjectPaymentIncome,
          projectPaymentNeed,
          projectPaymentTimeout,
          stockValve
        } = response.data
        this.lastMonthMaterialBuyingPay = lastMonthMaterialBuyingPay / 100
        this.lastMonthProjectPaymentIncome = lastMonthProjectPaymentIncome / 100
        this.projectPaymentNeed = projectPaymentNeed / 100
        this.projectPaymentTimeout = projectPaymentTimeout / 100
        this.stockValve = stockValve / 100
      })
    },
    handleDetails(type) {
      this.$router.push({
        path: "/report/overview",
        query: {
          type
        }
      })
    }
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

@media only screen and (min-width: 1200px) {
  .el-col-lg-5 {
    width: 20%;
  }
}
</style>
