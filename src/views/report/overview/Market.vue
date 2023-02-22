<template>
  <div>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="客户名称" prop="name"/>
      <el-table-column label="项目名称" prop="address"/>
      <el-table-column label="合同金额" align="center" prop="contactName"/>
      <el-table-column label="已收款金额" align="center" prop="contactMobile"/>
      <el-table-column label="待收金额" prop="email"/>
      <el-table-column label="销售负责人" align="center" prop="updateTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import {
  getCustomerPage,
} from '@/api/config/customer'
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
      getCustomerPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
  }
}
</script>
