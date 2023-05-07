<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item>
        <tree-select style="width: 200px" v-model="queryParams.storeAreaId" :defaultExpandLevel="2" :options="menuOptions" :normalizer="normalizer"
                     :show-count="true" placeholder="选择库区"/>
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
    <el-table v-loading="loading" :data="list">
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
      <el-table-column label="所在仓库">
        <template v-slot="{ row }">
          <span>{{ row.material.warehouse }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所在库区" prop="storeAreaId"/>
      <el-table-column label="所在位置" prop="storeAreaLocation"/>
      <el-table-column label="库存数量" prop="qty"/>
      <el-table-column label="预警数量">
        <template v-slot="{ row }">
          <span>{{ row.material.warnStock }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采购平均单价" prop="avg"/>
      <!--总价值=qty*avg-->
      <el-table-column label="总价值" prop="address"/>
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
export default {
  name: 'Stock',
  components: {
    TreeSelect
  },
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 类型选项
      menuOptions: [],
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
  mounted() {
    this.getStoreAreaPage()
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getStockPage(this.queryParams).then(response => {
        const {list, total} = response.data
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 获取厂区精简信息列表 */
    getStoreAreaPage() {
      getStoreAreaPage().then(response => {
        const {data} = response
        this.menuOptions = this.handleTree(data, 'id')
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
  }
}
</script>
