<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:store-area:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="el-icon-download" size="mini" @click="handleDownload"
                   v-hasPermi="['config:supplier:export']">下载库位编码</el-button>
      </el-col>
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
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['config:store-area:update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['config:store-area:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" :disabled="isEdit" placeholder="请选择类型" style="width: 100%" @change="handleTypeChange">
            <el-option v-for="dict in this.getDictDatas(DICT_TYPE.CONFIG_STORE_TYPE)"
                       :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="所属仓库" v-if="isWarehouse" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择所属仓库" style="width: 100%">
            <el-option v-for="store in storeList" :key="store.id" :label="store.name" :value="store.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="给目标起个名字"/>
        </el-form-item>
        <el-form-item label="库区规格" v-if="isWarehouse" required>
          <el-row type="flex" justify="space-between">
            <el-col :span="7">
              <el-form-item prop="row">
                <el-input-number :controls="false" v-model="form.row" :min="1" :max="99" placeholder="排" style="width: 100%"/>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">*</el-col>
            <el-col :span="7">
              <el-form-item prop="layer">
                <el-input-number :controls="false" v-model="form.layer" :min="1" :max="99" placeholder="层" style="width: 100%"/>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">*</el-col>
            <el-col :span="7">
              <el-form-item prop="column">
                <el-input-number :controls="false" v-model="form.column" :min="1" :max="99" placeholder="列" style="width: 100%"/>
              </el-form-item>
            </el-col>
          </el-row>
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
  createStoreArea,
  updateStoreArea,
  deleteStoreArea,
  getStoreArea,
  getStoreAreaPage,
  getStoreSimpleList,
  exportStoreAreaExcel
} from '@/api/config/storeArea'
import DrawerPlus from '@/components/DrawerPlus/index.vue'

export default {
  name: 'StoreArea',
  components: {
    DrawerPlus
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 仓库/库区列表
      list: [],
      // 所属仓库列表
      storeList: [],
      // 是否是仓库类型
      isWarehouse: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 是否是编辑
      isEdit: false,
      // 查询参数
      queryParams: {
        name: null
      },
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        type: undefined,
        parentId: 0,
        specs: undefined,
        row: undefined,
        layer: undefined,
        column: undefined
      },
      // 表单校验
      rules: {
        type: [{ required: true, message: '仓储类型不能为空', trigger: 'change' }],
        name: [
          { required: true, message: '仓储名称不能为空', trigger: 'blur' },
          { max: 30, message: '仓储类型不能超过30个字符', trigger: 'change' }
        ],
        row: [{ required: true, type: 'number', message: '排不能为空', trigger: 'blur' }],
        layer: [{ required: true, type: 'number', message: '层不能为空', trigger: 'blur' }],
        column: [{ required: true, type: 'number', message: '列不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getStoreSimpleList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getStoreAreaPage(this.queryParams).then(response => {
        const {data} = response
        data.map(item => {
          const [row, layer, column] = item.specs?.split('-') || []
          item.quantity = row * layer * column
        })
        this.list = this.handleTree(data, 'id')
        this.loading = false
      })
    },
    /** 获取仓库精简信息列表 */
    getStoreSimpleList() {
      getStoreSimpleList().then(response => {
        response.data.unshift({ id: 0, name: '顶级仓库' })
        this.storeList = response.data
      })
    },
    /** 切换仓储类型 */
    handleTypeChange(val) {
      this.isWarehouse = val !== 0;
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
        type: undefined,
        parentId: 0,
        specs: undefined,
        row: undefined,
        layer: undefined,
        column: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.isEdit = false
      this.open = true
      this.title = '添加仓库/库区'
    },
    /** 下载库位编码按钮操作 */
    handleDownload() {
      exportStoreAreaExcel().then(res => {
        this.$download.excel(res, '库位信息.xls');
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.isEdit = true
      const id = row.id
      getStoreArea(id).then(response => {
        this.form = response.data
        this.isWarehouse = response.data.type !== 0
        if (response.data.specs) {
          const specs = response.data.specs.split('-')
          this.form.row = specs[0]
          this.form.layer = specs[1]
          this.form.column = specs[2]
        }
        this.open = true
        this.title = '修改仓库/库区'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        if (this.form.type === 1) {
          this.form.specs = this.form.row + '-' + this.form.layer + '-' + this.form.column
        }
        // 修改的提交
        if (this.form.id != null) {
          updateStoreArea(this.form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
            this.getStoreSimpleList()
          })
          return
        }
        // 添加的提交
        createStoreArea(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
          this.getStoreSimpleList()
        })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      const name = row.name
      this.$modal.confirm('是否确认删除名称为"' + name + '"的数据项?').then(function() {
        return deleteStoreArea(id)
      }).then(() => {
        this.getList()
        this.getStoreSimpleList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  }
}
</script>
