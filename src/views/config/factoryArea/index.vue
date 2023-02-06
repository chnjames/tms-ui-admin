<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form v-show="showSearch" :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item>
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:factory-area:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-if="refreshTable" v-loading="loading" :data="list" row-key="id" :default-expand-all="isExpandAll"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="描述" show-overflow-tooltip align="center" prop="description"/>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['config:factory-area:update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['config:factory-area:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <el-drawer :title="title" :visible.sync="open" size="30%" append-to-body>
      <el-form class="drawer-form" ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="给目标起个名字"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :rows="2" v-model="form.description" placeholder="填写简短说明"/>
        </el-form-item>
        <el-form-item label="上级" prop="parentId">
          <tree-select v-model="form.parentId" :defaultExpandLevel="2" :options="menuOptions" :normalizer="normalizer"
                       :show-count="true" placeholder="选择上级"/>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-divider/>
        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </el-row>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  createFactoryArea,
  deleteFactoryArea,
  getFactoryArea,
  getFactoryAreaPage,
  getSimpleFactoryArea,
  updateFactoryArea
} from '@/api/config/factoryArea'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'FactoryArea',
  components: { TreeSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 总条数
      total: 0,
      // 工厂区域列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null
      },
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        description: undefined,
        status: 0,
        parentId: undefined
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { max: 30, message: '名称不能超过30个字', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '描述不能为空', trigger: 'blur' },
          { max: 120, message: '描述不能超过120个字', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '上级不能为空', trigger: 'blur' }
        ]
      },
      // 菜单树选项
      menuOptions: []
    }
  },
  created() {
    this.getList()
    this.getSimpleFactoryArea()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getFactoryAreaPage(this.queryParams).then(response => {
        this.total = response.data.total
        this.list = this.handleTree(response.data.list, 'id')
        this.loading = false
      })
    },
    /** 获取厂区精简信息列表 */
    getSimpleFactoryArea() {
      getSimpleFactoryArea().then(response => {
        this.menuOptions = []
        const menu = { id: 0, name: '顶级', children: [] }
        menu.children = this.handleTree(response.data, 'id')
        this.menuOptions.push(menu)
      })
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
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        description: undefined,
        status: 0,
        parentId: undefined
      }
      this.resetForm('form')
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      getFactoryArea(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        // 修改的提交
        if (this.form.id != null) {
          updateFactoryArea(this.form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
          return
        }
        // 添加的提交
        createFactoryArea(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      console.log(row)
      const name = row.name
      const id = row.id
      this.$modal.confirm('是否确认删除名称为"' + name + '"的数据项?').then(function() {
        return deleteFactoryArea(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.drawer-form {
  padding: 20px;
}

.dialog-footer {
  background-color: #FFFFFF;
  text-align: right;
  padding: 10px 20px;
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>
