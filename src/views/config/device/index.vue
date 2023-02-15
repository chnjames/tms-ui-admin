<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--树结构数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="areaName" placeholder="请输入区域名称" clearable size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px"/>
        </div>
        <div class="head-container">
          <el-tree ref="tree" v-loading="treeLoading" highlight-current :data="treeData" :expand-on-click-node="false" :props="defaultProps"
                   default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick"></el-tree>
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <!-- 搜索工作栏 -->
        <el-form v-show="showSearch" :model="queryParams" ref="queryForm" size="small" :inline="true">
          <el-form-item prop="type">
            <el-select v-model="queryParams.type" placeholder="设备类型" clearable @clear="handleClear">
              <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.type" :value="item.type"/>
            </el-select>
          </el-form-item>
          <el-form-item prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入设备名称" clearable
                      @keyup.enter.native="handleQuery"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          </el-form-item>
        </el-form>
        <!-- 操作工具栏 -->
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                       v-hasPermi="['config:device:create']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button plain icon="el-icon-download" size="mini" @click="handleDownload"
                       v-hasPermi="['config:device:create']">模板下载</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-upload2" size="mini" @click="handleAdd"
                       v-hasPermi="['config:device:create']">批量上传</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="loading" :data="list" ref="multipleTable">
          <!--选择-->
          <el-table-column type="selection" width="55" align="center"/>
          <el-table-column label="设备编码" align="center" prop="code"/>
          <el-table-column label="设备名称" align="center" prop="name" show-overflow-tooltip/>
          <el-table-column label="所在区域" align="center" prop="factoryAreaName"/>
          <el-table-column label="设备类型" align="center" prop="type"/>
          <el-table-column label="设备规格" align="center" prop="description"/>
          <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template v-slot="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                         v-hasPermi="['config:device:update']">编辑</el-button>
              <el-button size="mini" type="text" icon="el-icon-document" @click="handleUpdate(scope.row)"
                         v-hasPermi="['config:device:update']">设备日志</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                         v-hasPermi="['config:device:delete']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo"
                    :limit.sync="queryParams.pageSize" @pagination="getList"/>
      </el-col>
    </el-row>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus  :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入设备编码"/>
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入设备名称"/>
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="form.type" filterable allow-create default-first-option placeholder="请选择设备类型"
                     style="width: 100%">
            <el-option v-for="(item, index) in menuOptions" :key="index" :label="item.type" :value="item.type"/>
          </el-select>
        </el-form-item>
        <el-form-item label="设备规格" prop="description">
          <el-input type="textarea" :rows="2" v-model="form.description" placeholder="请输入设备规格"/>
        </el-form-item>
        <el-form-item label="所在位置" prop="factoryAreaId">
          <tree-select v-model="form.factoryAreaId" :defaultExpandLevel="2" :options="treeData" :normalizer="normalizer"
                       :show-count="true" placeholder="选择所在位置"
          />
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
  createDevice,
  updateDevice,
  deleteDevice,
  getDevice,
  getDevicePage,
  getDeviceTypeList
} from '@/api/config/device'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getSimpleFactoryArea } from '@/api/config/factoryArea'
import DrawerPlus from '@/components/DrawerPlus/index.vue'

export default {
  name: 'Device',
  components: { DrawerPlus, TreeSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 树形遮罩层
      treeLoading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 设备列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 区域名称
      areaName: undefined,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        factoryAreaId: null,
        name: null,
        type: null
      },
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        code: undefined,
        type: undefined,
        description: undefined,
        factoryAreaId: undefined,
        status: 0
      },
      // 表单校验
      rules: {
        code: [
          { required: true, message: '设备编码不能为空', trigger: 'blur' },
          { max: 30, message: '设备编码不能超过30个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '设备名称不能为空', trigger: 'blur' },
          { max: 30, message: '设备名称不能超过30个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '设备类型不能为空', trigger: 'change' },
          { max: 30, message: '设备类型不能超过30个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '设备规格不能为空', trigger: 'blur' },
          { max: 100, message: '设备规格不能超过100个字符', trigger: 'blur' }
        ],
        factoryAreaId: [{ required: true, message: '设备所在位置不能为空', trigger: 'blur' }]
      },
      // 菜单树选项
      menuOptions: [],
      // 侧边栏菜单
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  watch: {
    // 根据名称筛选部门树
    areaName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList()
    this.getSimpleFactoryArea()
    this.getDeviceTypeList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getDevicePage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.loading = false
      })
    },
    /** 获取厂区精简信息列表 */
    getSimpleFactoryArea() {
      this.treeLoading = true
      getSimpleFactoryArea().then(response => {
        const menu = { id: '', name: '顶级', children: [] }
        menu.children = this.handleTree(response.data)
        this.treeData = [menu]
        this.treeLoading = false
      })
    },
    /** 获取设备类型列表 */
    getDeviceTypeList() {
      getDeviceTypeList().then(response => {
        this.menuOptions = response.data
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    /** 侧边栏菜单点击事件 */
    handleNodeClick(data) {
      this.queryParams.factoryAreaId = data.id
      this.getList()
    },
    /** 清除设备类型 */
    handleClear() {
      this.queryParams.type = null
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
        code: undefined,
        type: undefined,
        description: undefined,
        factoryAreaId: undefined,
        status: 0
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
      this.getSimpleFactoryArea()
      this.getDeviceTypeList()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加设备'
    },
    /** 模板下载操作 */
    handleDownload() {
      let arr = this.$refs.multipleTable.selection
      if (arr.length === 0) {
        this.$message({
          type: 'warning',
          message: '请选择要下载的数据'
        })
        return
      }
      console.log(arr)
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      getDevice(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改设备'
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
          updateDevice(this.form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
            this.getSimpleFactoryArea()
            this.getDeviceTypeList()
          })
          return
        }
        // 添加的提交
        createDevice(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
          this.getSimpleFactoryArea()
          this.getDeviceTypeList()
        })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除设备编号为"' + id + '"的数据项?').then(function() {
        return deleteDevice(id)
      }).then(() => {
        this.getList()
        this.getSimpleFactoryArea()
        this.getDeviceTypeList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  }
}
</script>
