<template>
  <div>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:factory-area:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="bindInitiate"
                   v-hasPermi="['config:factory-area:create']">发起出库</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-input v-show="showSearch" v-model="queryParams.name" size="mini" placeholder="请输入任务名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- 列表 -->
    <el-table ref="multipleTable" v-loading="loading" :data="list">
      <el-table-column type="selection" :selectable="compSelection" :width="55" align="center" />
      <el-table-column
        v-for="(item, index) in tableHeader"
        :key="index"
        :prop="item.prop"
        :width="item.width"
        :fixed="item.fixed"
        :label="item.label">
        <template v-slot="{row}">
          <template v-if="item.prop === 'operation'">
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                       v-hasPermi="['config:factory-area:delete']"
                       :disabled="row.status === 2">删除</el-button>
            <el-button size="mini" type="text" icon="el-icon-s-promotion" @click="bindPurchase(row)"
                       v-hasPermi="['config:factory-area:update']"
                       :disabled="row.status !== 3">发起采购</el-button>
          </template>
          <template v-else-if="item.prop === 'createTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <template v-else-if="item.prop === 'count'">
            <el-input v-if="row.isSelected" v-model="row.count" @focus="handleFocus(row)" @blur="handleBlur(row)" v-auto-focus></el-input>
            <div style="cursor: pointer;" @click="handleDemand(row)" v-else>{{row.count}}</div>
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框BOM(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="550" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模糊查询">
          <el-input v-model="form.search" placeholder="输入物料名称" clearable @blur="handleSearch" @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="物料名称" prop="materialId" v-if="materialList.length > 0">
          <el-table class="material" ref="selectList" :height="300" v-loading="formLoading" :data="materialList" :show-header="false" @selection-change="selectedChange">
            <el-table-column
              v-for="(item, index) in materialHeader"
              :key="index"
              :prop="item.prop"
              :width="item.width"
              :fixed="item.fixed"
              :label="item.label">
              <template v-slot="{row}">{{ row[item.prop] }}</template>
            </el-table-column>
            <el-table-column type="selection" :width="55" align="center" />
          </el-table>
        </el-form-item>
        <el-form-item label="需求数量" prop="count">
          <el-input-number v-model="form.count" controls-position="right" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="bindContinueAdd">继续添加</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </drawer-plus>
    <!-- 对话框发起出库(添加 / 修改) -->
    <drawer-plus :title="initiateTitle" :visible.sync="initiateOpen" :size="550" append-to-body>
      <el-form ref="initiateForm" :model="initiateForm" :rules="initiateRules" label-width="100px">
        <el-form-item label="指定部门" prop="deptId">
          <tree-select v-model="initiateForm.deptId" :options="deptList" :show-count="true" :clearable="false"
                       placeholder="请选择指定部门" :normalizer="normalizer" />
        </el-form-item>
        <el-form-item label="指定负责人" prop="blameId">
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
import { getMatchMaterialList } from '@/api/warehouse/material'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listSimpleUsers } from '@/api/system/user'
import { listSimpleDepts } from '@/api/system/dept'
import { createBom, createPurchase, deleteBom, getBomList, updateBom, createOutbound } from '@/api/operations/overview'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'BomList',
  components: { DrawerPlus, TreeSelect },
  data() {
    const validateSearch = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入物料名称进行搜索'))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 物料列表加载中
      formLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 用户列表
      userList: [],
      // 部门列表
      deptList: [],
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
        projectId: null
      },
      // 基础表头
      tableHeader: [
        { prop: 'materialCode', label: '物料编号' },
        { prop: 'materialName', label: '物料名称' },
        { prop: 'materialSpecs', label: '规格型号' },
        { prop: 'count', label: '需求数量' },
        { prop: 'statusDesc', label: '状态' },
        { prop: 'createTime', label: '添加时间' },
        { prop: 'operation', label: '操作' }
      ],
      bomStatusList: getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_BOM_STATUS), // BOM需求状态列表
      // 物料表头
      materialHeader: [
        { prop: 'code', label: '物料编码' },
        { prop: 'name', label: '物料名称' }
      ],
      // 物料列表
      materialList: [],
      selectList: [], // 选中的物料列表
      // 表单参数
      form: {
        projectId: undefined, // 项目id
        search: undefined, // 模糊查询
        materialId: undefined, // 物料id
        count: undefined // 需求数量
      },
      // 表单校验
      rules: {
        materialId: [
          // 判断 search 是否为空
          { required: true, message: '物料名称不能为空', trigger: 'blur' },
          { validator: validateSearch, trigger: 'blur' }
        ],
        count: { required: true, type: 'number', message: '需求数量不能为空', trigger: 'blur' }
      },
      // 任务指派列表
      taskAssignList: [
        { type: 1, label: '选择部门' },
        { type: 2, label: '选择人员' }
      ],
      // 发起出库弹出层参数
      // 弹出层标题
      initiateTitle: '',
      // 是否显示弹出层
      initiateOpen: false,
      // 表单参数
      initiateForm: {
        ids: undefined,
        deptId: undefined, // 指定部门
        blameId: undefined // 指定负责人
      },
      // 表单校验
      initiateRules: {
        deptId: { required: true, message: '指定部门不能为空', trigger: 'change' },
        blameId: { required: true, message: '指定负责人不能为空', trigger: 'change' }
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
    this.getDeptList()
  },
  computed: {
    proId() {
      return this.$route.query.id
    }
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
    /** 物料列表 */
    getMaterialList(name) {
      this.formLoading = true;
      getMatchMaterialList({name}).then(response => {
        this.materialList = response.data
        this.formLoading = false;
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      this.queryParams.projectId = this.proId;
      getBomList(this.queryParams).then(response => {
        const { data } = response || []
        data.map(item => {
          item.statusDesc = this.bomStatusList.find(i => parseInt(i.value) === item.status).label
          item.isSelected = false
        })
        this.list = data;
        this.loading = false;
      });
    },
    /** 限制list列表多选 */
    compSelection(row) {
      return row.status === 0;
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 发起采购 */
    bindPurchase(row) {
      this.$confirm('确定发起采购？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        createPurchase({ id: row.id }).then(response => {
          this.$message.success('发起采购成功')
          this.getList()
        })
      })
    },
    /** 继续添加 */
    bindContinueAdd() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        this.form.projectId = this.$route.query.id
        createBom(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.getList()
          this.reset()
        })
      })
    },
    /** 表单重置 */
    reset() {
      this.$refs.selectList?.clearSelection();
      this.form = {
        projectId: undefined,
        search: undefined,
        materialId: undefined,
        count: undefined // 需求数量
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
    /** 发起出库按钮操作 */
    bindInitiate() {
      const initiateList = this.$refs.multipleTable.selection
      if (initiateList.length === 0) {
        this.$message.warning('请先选择BOM')
        return
      }
      this.initiateTitle = '发起出库'
      this.initiateOpen = true
      this.resetInitiateForm()
      this.getDeptList()
    },
    /** 删除按钮操作 */
    resetInitiateForm() {
      this.initiateForm = {
        ids: undefined,
        deptId: undefined, // 指定部门
        blameId: undefined // 指定负责人
      }
      this.resetForm('initiateForm')
    },
    /** 取消出库按钮操作 */
    cancelInitiate() {
      this.initiateOpen = false
      this.resetInitiateForm()
    },
    /** 点击需求数量 */
    handleDemand(row) {
      // 未出库、库存不足才可以修改
      if (row.status === 0 || row.status === 3) {
        row.isSelected = !row.isSelected
      } else {
        this.$message.warning(`${row.statusDesc}不可修改`)
      }
    },
    /** 聚焦需求数量 */
    handleFocus(row) {
      row.oldDemand = row.count
    },
    /** 失焦需求数量 */
    handleBlur(row) {
      row.isSelected = !row.isSelected
      if (row.count !== row.oldDemand) {
        updateBom({
          count: row.count,
          id: row.id
        }).then(() => {
          this.$message.success('修改需求数量成功')
          this.getList()
        })
      }
    },
    /** 提交出库按钮操作 */
    submitInitiate() {
      this.$refs.initiateForm.validate((valid) => {
        if (valid) {
          const initiateList = this.$refs.multipleTable.selection
          this.initiateForm.ids = initiateList.map(item => item.id)
          createOutbound(this.initiateForm).then(response => {
            this.$message.success('发起出库成功')
            this.initiateOpen = false
            this.getList()
          })
        }
      })
    },
    /** 模糊查询 */
    handleSearch() {
      console.log(this.form)
      this.getMaterialList(this.form.search)
    },
    /** 单选物料名称 */
    selectedChange(selection) {
      this.selectList = []
      if (selection.length > 1) {
        this.$refs.selectList.clearSelection();
        this.$refs.selectList.toggleRowSelection(selection[selection.length - 1]);
      }
      this.selectList = [selection[selection.length - 1]]
      console.log(this.selectList)
      this.form.materialId = this.selectList.length > 0 ? this.selectList[0].id : ''
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        this.form.projectId = this.$route.query.id
        // 添加的提交
        createBom(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const code = row.materialCode
      const id = row.id
      this.$modal.confirm('是否确认删除物料编码为"' + code + '"的数据项?').then(function() {
        return deleteBom(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
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
<style lang="scss" scoped>
.material {
  // 隐藏表头的复选框
  :deep(.el-table__header-wrapper .el-checkbox) {
    display: none;
  }
  :deep(.el-table__body-wrapper) {
    border-top: 1px solid #ebeef5;
    border-left: 1px solid #ebeef5;
    border-right: 1px solid #ebeef5;
    box-sizing: border-box;
  }
}
</style>
