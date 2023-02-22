<template>
  <div>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="物料编号" prop="name"/>
      <el-table-column label="物料名称" prop="name"/>
      <el-table-column label="品牌" prop="name"/>
      <el-table-column label="物料类别" prop="name"/>
      <el-table-column label="规格型号" prop="name"/>
      <el-table-column label="所在仓库" prop="name"/>
      <el-table-column label="所在库区" prop="name"/>
      <el-table-column label="所在位置" prop="name"/>
      <el-table-column label="库存数量" prop="name"/>
      <el-table-column label="预警数量" prop="name"/>
      <el-table-column label="采购平均单价" prop="name"/>
      <el-table-column label="总价值" prop="address"/>
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
  name: 'Stock',
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
