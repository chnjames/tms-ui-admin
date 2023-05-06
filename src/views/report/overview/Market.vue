<template>
  <div>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="客户名称" prop="contactId"/>
      <el-table-column label="项目名称" prop="projectId"/>
      <el-table-column label="合同金额" align="center" prop="totalAmount"/>
      <el-table-column label="已收款金额" align="center" prop="receivedAmount"/>
      <el-table-column label="待收金额" prop="timeoutAmount"/>
      <el-table-column label="销售负责人" align="center" prop="blameId" width="180"/>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import { getSalesOverview } from '@/api/report/operations'
export default {
  name: 'Market',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 销售列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getSalesOverview(this.queryParams).then(response => {
        const {list, total} = response.data
        this.list = list
        this.total = total
        this.loading = false
      })
    },
  }
}
</script>
