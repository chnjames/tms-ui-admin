<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item>
        <tree-select v-model="queryParams.storeAreaId" :defaultExpandLevel="2" :options="menuOptions" :normalizer="normalizer"
                     :show-count="true" :max-height="180" placeholder="选择库区"/>
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.name" placeholder="请输入" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button plain size="mini" @click="handleBack">返回</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="list" show-summary :summary-method="getSummaries">
      <el-table-column label="物料编号">
        <template v-slot="{ row }">
          <span>{{row.material.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料名称">
        <template v-slot="{ row }">
          <span>{{ row.material.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌">
        <template v-slot="{ row }">
          <span>{{ row.material.brand }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料类别">
        <template v-slot="{ row }">
          <span>{{ row.material.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规格型号">
        <template v-slot="{ row }">
          <span>{{ row.material.specs }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所在仓库" prop="warehouse"/>
      <el-table-column label="所在库区" prop="storeArea"/>
      <el-table-column label="所在位置" prop="storeAreaLocation"/>
      <el-table-column label="库存数量" prop="qty"/>
      <el-table-column label="预警数量">
        <template v-slot="{ row }">
          <span>{{ row.material.warnStock }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采购平均单价" prop="avgDesc"/>
      <!--总价值=qty*avg-->
      <el-table-column label="总价值" prop="amount">
        <template v-slot="{ row }">
          <span>{{ row.amountDesc }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import { getStockPage } from '@/api/report/operations'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getStoreAreaPage } from '@/api/config/storeArea'
import { formatMoney } from '@/utils'
export default {
  name: 'Stock',
  components: {
    TreeSelect
  },
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 厂区列表
      menuOptions: [],
      // 厂区未分组列表
      scatteredStoreArea: [],
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
        storeAreaId: null,
        name: null
      }
    }
  },
  async mounted() {
    // 获取厂区精简信息列表
    const [storeAreaData] = await Promise.all([getStoreAreaPage()])
    this.scatteredStoreArea = storeAreaData.data
    this.menuOptions = this.handleTree(storeAreaData.data, 'id')
    await this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getStockPage(this.queryParams).then(response => {
        const {list, total} = response.data
        list.map(item => {
          item.avgDesc = formatMoney(item.avg / 100 ?? 0)
          item.amount = item.qty * item.avg
          item.amountDesc = formatMoney(item.amount / 100 ?? 0)
          item.storeArea = this.scatteredStoreArea.find(i => i.id === item.storeAreaId).name
          item.storeParentId = this.scatteredStoreArea.find(i => i.id === item.storeAreaId).parentId
          item.warehouse = item.storeParentId === 0 ? item.storeArea : this.scatteredStoreArea.find(i => i.id === item.storeParentId).name;
        })
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 返回按钮操作 */
    handleBack() {
      this.$router.go(-1)
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
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
        if (column.property === 'amount') {
          sums[index] = data.reduce((prev, curr) => {
            const value = Number(curr[column.property]);
            if (!isNaN(value)) {
              return prev + curr[column.property];
            } else {
              return prev;
            }
          }, 0);
          sums[index] = formatMoney(sums[index] / 100);
        } else {
          sums[index] = '';
        }
      });
      return sums;
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.vue-treeselect) {
  width: 200px;
  line-height: 30px;
  .vue-treeselect__placeholder {
    line-height: 30px;
  }
  .vue-treeselect__control {
    height: 30px;
  }
}
</style>
