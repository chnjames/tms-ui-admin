<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form v-show="showSearch" :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item>
        <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:factory-area:create']">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--切换状态-->
    <el-tabs v-model="curTab">
      <el-tab-pane v-for="item in tabList" :key="item.name" :label="item.title" :name="item.name" />
    </el-tabs>
    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="子任务名称" prop="name" />
      <el-table-column label="执行人" prop="name" />
      <el-table-column label="内部关注人" prop="name" />
      <el-table-column label="外部关注人" prop="name" />
      <el-table-column label="预估工时" prop="name" />
      <el-table-column label="消耗工时" prop="name" />
      <el-table-column label="委外费用($)" prop="name" />
      <el-table-column label="状态" prop="name" />
      <el-table-column label="开始时间" align="center" prop="updateTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="updateTime" width="180">
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
    <drawer-plus :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
      <template slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </drawer-plus>
  </div>
</template>

<script>
import {
  createFactoryArea,
  deleteFactoryArea,
  getFactoryArea,
  getSimpleFactoryArea,
  updateFactoryArea
} from '@/api/config/factoryArea'
import { getCustomerPage } from "@/api/config/customer";
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import DrawerPlus from '@/components/DrawerPlus/index.vue'

export default {
  name: 'TaskInfo',
  components: { DrawerPlus, TreeSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // tabs列表
      tabList: [
        { name: '1', title: '全部任务' },
        { name: '2', title: '已完成' },
        { name: '3', title: '延期未完成' }
      ],
      // 当前tab
      curTab: '1',
      // 任务详情列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: null,
        pageNo: 1,
        pageSize: 10
      },
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        description: undefined,
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
          { max: 100, message: '描述不能超过100个字', trigger: 'blur' }
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
      this.loading = true;
      // 执行查询
      getCustomerPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 获取厂区精简信息列表 */
    getSimpleFactoryArea() {
      getSimpleFactoryArea().then(response => {
        this.menuOptions = []
        const menu = { id: 0, name: '顶级', children: [] }
        menu.children = this.handleTree(response.data)
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
        parentId: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
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
            this.getSimpleFactoryArea()
          })
          return
        }
        // 添加的提交
        createFactoryArea(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
          this.getSimpleFactoryArea()
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
        this.getSimpleFactoryArea()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  }
}
</script>
