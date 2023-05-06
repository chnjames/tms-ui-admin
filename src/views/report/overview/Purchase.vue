<template>
  <div>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="物料编号">
        <template v-slot="{ row }">
          <span>{{ row.material.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料类型">
        <template v-slot="{ row }">
          <span>{{ row.material.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料名称">
        <template v-slot="{ row }">
          <span>{{ row.material.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="供应商" prop="supplierId"/>
      <el-table-column label="历史平均单价" prop="avg"/>
      <el-table-column label="采购单价" prop="price"/>
      <el-table-column label="采购数量" prop="count"/>
      <el-table-column label="金额" align="center" prop="contactName"/>
      <el-table-column label="需求发起人" align="center" prop="demanderId"/>
      <el-table-column label="采购负责人" prop="blameId"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-files" @click="handleHistory(scope.row)">历史价格</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!--历史价格-->
    <el-dialog title="采购记录" :visible.sync="purchaseVisible" width="1000px" append-to-body>
      <el-table v-loading="purchaseLoading" :data="list" style="width: 100%">
        <el-table-column label="物料编号" prop="name"/>
        <el-table-column label="物料类型" prop="name"/>
        <el-table-column label="物料名称" prop="name"/>
        <el-table-column label="供应商" prop="name"/>
        <el-table-column label="历史采购单价" prop="name"/>
        <el-table-column label="采购数量" prop="address"/>
        <el-table-column label="金额" align="center" prop="contactName"/>
        <el-table-column label="采购负责人" align="center" prop="contactMobile"/>
        <el-table-column label="采购发起时间" prop="email"/>
      </el-table>
      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                  @pagination="getList"/>
    </el-dialog>
  </div>
</template>

<script>
import { getMaterialPurchasePage } from '@/api/report/operations'
export default {
  name: 'Purchase',
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
      },
      // 采购记录
      purchaseVisible: false,
      // 采购记录遮罩层
      purchaseLoading: false
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
      getMaterialPurchasePage(this.queryParams).then(response => {
        const {list, total} = response.data
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 历史价格 */
    handleHistory(row) {
      console.log(row)
      this.purchaseVisible = true
    }
  }
}
</script>
