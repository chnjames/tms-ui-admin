<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-if="refreshTable" v-loading="loading" :data="list" row-key="id" :default-expand-all="isExpandAll"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="名称" prop="name"/>
      <el-table-column label="储位数量" align="center" prop="quantity"/>
      <el-table-column label="储位规格(排*层*列)" align="center" prop="specs"/>
      <el-table-column label="最新开始时间" align="center" prop="lastStocktakingBeginTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.lastStocktakingBeginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最新完成时间" align="center" prop="lastStocktakingEndTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.lastStocktakingEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" v-if="scope.row.type === 1" type="text" icon="el-icon-files" @click="bindStocktaking(scope.row)"
                     v-hasPermi="['warehouse:stocktaking:update']">盘点</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="initiateTitle" :visible.sync="initiateOpen" :size="550" append-to-body>
      <el-form ref="initiateForm" :model="initiateForm" :rules="initiateRules" label-width="100px">
        <el-form-item label="指定部门" prop="deptId">
          <tree-select @select="bindDept" v-model="initiateForm.deptId" :options="deptList" :show-count="true" :clearable="false"
                       placeholder="请选择指定部门" :normalizer="normalizer" />
        </el-form-item>
        <el-form-item label="指定负责人">
          <el-select v-model="initiateForm.blameId" style="width: 100%" placeholder="请选择指定负责人">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="cancelInitiate">取 消</el-button>
        <el-button type="primary" @click="submitInitiate">确 定</el-button>
      </template>
    </drawer-plus>
  </div>
</template>

<script>
import {
  getStocktakingPage,
  stocktakingExec
} from '@/api/warehouse/stocktaking'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listSimpleUsers } from '@/api/system/user'
import { listSimpleDepts } from '@/api/system/dept'

export default {
  name: 'Stocktaking',
  components: { DrawerPlus, TreeSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 仓库盘点列表
      list: [],
      // 是否展开，默认全部展开
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null
      },
      // 用户列表
      userList: [],
      // 部门列表
      deptList: [],
      // 弹出层标题
      initiateTitle: '',
      // 是否显示弹出层
      initiateOpen: false,
      // 表单参数
      initiateForm: {
        deptId: undefined, // 指定部门
        blameId: undefined, // 指定负责人
        areaId: undefined // 项目id
      },
      // 表单校验
      initiateRules: {
        deptId: { required: true, message: '指定部门不能为空', trigger: 'change' }
      }
    }
  },
  async created() {
    await this.getUserList()
    await this.getList()
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 部门列表 */
    getDeptList() {
      listSimpleDepts().then(response => {
        this.deptList = [];
        this.deptList.push(...this.handleTree(response.data, "id"));
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getStocktakingPage(this.queryParams).then(response => {
        const { data } = response
        data.map(item => {
          const [row, layer, column] = item.specs?.split('-') || []
          item.quantity = row * layer * column
        })
        this.list = this.handleTree(data)
        console.log(this.list)
        this.loading = false
      })
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 盘点 */
    bindStocktaking(item) {
      this.initiateTitle = '创建盘点任务'
      this.initiateOpen = true
      this.resetInitiateForm()
      this.initiateForm.areaId = item.id
      this.getDeptList()
    },
    /** 删除按钮操作 */
    resetInitiateForm() {
      this.initiateForm = {
        deptId: undefined, // 指定部门
        blameId: undefined, // 指定负责人
        areaId: undefined // 项目id
      }
      this.resetForm('initiateForm')
    },
    /** 取消出库按钮操作 */
    cancelInitiate() {
      this.initiateOpen = false
      this.resetInitiateForm()
    },
    /** 提交创建盘点任务操作 */
    submitInitiate() {
      this.$refs.initiateForm.validate((valid) => {
        if (valid) {
          stocktakingExec(this.initiateForm).then(() => {
            this.$message.success('创建盘点任务成功')
            this.initiateOpen = false
            this.getList()
          })
        }
      })
    },
    /** 模糊查询 */
    handleSearch() {
      this.getMaterialList(this.form.search)
    },
    // 根据部门获取负责人
    bindDept(item) {
      this.initiateForm.blameId = undefined
      this.getUserList(item.id)
    },
    // 格式化部门的下拉框
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    }
  }
}
</script>
