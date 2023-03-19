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
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" :width="55" align="center" />
      <el-table-column
        v-for="(item, index) in tableHeader"
        :key="index"
        :prop="item.prop"
        :width="item.width"
        :fixed="item.fixed"
        :label="item.label">
        <template v-slot="{row}">
          <template v-if="item.prop === 'operation'">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(row)"
                       v-hasPermi="['config:factory-area:update']">编辑</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                       v-hasPermi="['config:factory-area:delete']">删除</el-button>
          </template>
          <template v-else-if="item.prop === 'createTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框BOM(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="550" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模糊查询" prop="search">
          <el-input v-model="form.search" placeholder="输入物料名称"/>
        </el-form-item>
        <el-form-item label="物料名称" prop="name">
          <el-table ref="selectList" :height="300" v-loading="loading" :data="materialList" :show-header="false" @selection-change="selectedChange">
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
        <el-form-item label="需求数量" prop="demandQuantity">
          <el-input-number v-model="form.demandQuantity" controls-position="right" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="bindPurchase">发起采购</el-button>
        <el-button type="primary" @click="bindContinueAdd">继续添加</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </drawer-plus>
    <!-- 对话框发起采购(添加 / 修改) -->
    <drawer-plus :title="purchaseTitle" :visible.sync="purchaseOpen" :size="550" append-to-body>
      <el-form ref="purchaseForm" :model="purchaseForm" :rules="purchaseRules" label-width="100px">
        <el-form-item label="物料编码" prop="name">
          <div>M2348536</div>
        </el-form-item>
        <el-form-item label="物料名称" prop="name">
          <div>3相4线驱动电机</div>
        </el-form-item>
        <el-form-item label="物料类型" prop="name">
          <div>驱动类</div>
        </el-form-item>
        <el-form-item label="需求数量" prop="demandQuantity">
          <el-input-number v-model="purchaseForm.demandQuantity" controls-position="right" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="期望到货日期" prop="expectedDate">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.expectedDate" type="date"
                          value-format="timestamp" placeholder="选择期望到货日期"/>
        </el-form-item>
        <el-form-item label="任务指派" prop="taskAssign">
          <el-select v-model="form.taskAssign" style="width: 100%" placeholder="请选择任务指派">
            <el-option v-for="item in taskAssignList" :key="item.type" :label="item.label" :value="item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="指定部门" prop="departmentId" v-if="form.taskAssign === 1">
          <el-select v-model="form.departmentId" style="width: 100%" placeholder="请选择指定部门">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="指定负责人" prop="principalId" v-if="form.taskAssign === 2">
          <el-select v-model="form.principalId" style="width: 100%" placeholder="请选择指定负责人">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button @click="cancelPurchase">取 消</el-button>
        <el-button type="primary" @click="submitPurchase">确 定</el-button>
      </template>
    </drawer-plus>
    <!-- 对话框发起出库(添加 / 修改) -->
    <drawer-plus :title="initiateTitle" :visible.sync="initiateOpen" :size="550" append-to-body>
      <el-form ref="initiateForm" :model="initiateForm" :rules="initiateRules" label-width="100px">
        <el-form-item label="任务指派" prop="taskAssign">
          <el-select v-model="initiateForm.taskAssign" style="width: 100%" placeholder="请选择任务指派">
            <el-option v-for="item in taskAssignList" :key="item.type" :label="item.label" :value="item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="指定部门" prop="departmentId" v-if="initiateForm.taskAssign === 1">
          <el-select v-model="initiateForm.departmentId" style="width: 100%" placeholder="请选择指定部门">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="指定负责人" prop="principalId" v-if="initiateForm.taskAssign === 2">
          <el-select v-model="initiateForm.principalId" style="width: 100%" placeholder="请选择指定负责人">
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
  createFactoryArea,
  deleteFactoryArea,
  getFactoryArea,
  updateFactoryArea
} from '@/api/config/factoryArea'
import { getMatchMaterialList } from '@/api/warehouse/material'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { listSimpleUsers } from '@/api/system/user'
import {
  createPurchase,
  createBom,
  deleteBom,
  getBomList,
  createOutbound,
  updateBom
} from '@/api/operations/overview'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'BomList',
  components: { DrawerPlus },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 用户列表
      userList: [],
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
        name: null
      },
      // 基础表头
      tableHeader: [
        { prop: 'materialCode', label: '物料编号' },
        { prop: 'materialName', label: '物料名称' },
        { prop: 'materialSpecs', label: '规格型号' },
        { prop: 'demand', label: '需求数量' },
        { prop: 'status', label: '状态' },
        { prop: 'createTime', label: '添加时间' },
        { prop: 'operation', label: '操作' }
      ],
      bomStatusList: getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_BOM_STATUS), // BOM需求状态列表
      // 物料表头
      materialHeader: [
        { prop: 'code', label: '物料编码' },
        { prop: 'name', label: '物料名称' },
        // { prop: 'specs', label: '所在库区及所在库位(排*层*列)' },
        // { prop: 'warnStock', label: '数量' },
      ],
      // 物料列表
      materialList: [],
      selectList: [], // 选中的物料列表
      // 表单参数
      form: {
        id: undefined,
        search: undefined,
        name: undefined,
        demandQuantity: undefined // 需求数量
      },
      // 表单校验
      rules: {
        search: { required: true, message: '模糊查询不能为空', trigger: 'blur' },
        name: { required: true, message: '物料名称不能为空', trigger: 'blur' },
        demandQuantity: { required: true, type: 'number', message: '需求数量不能为空', trigger: 'blur' }
      },
      // 采购弹出层参数
      // 弹出层标题
      purchaseTitle: '',
      // 是否显示弹出层
      purchaseOpen: false,
      // 任务指派列表
      taskAssignList: [
        { type: 1, label: '选择部门' },
        { type: 2, label: '选择人员' }
      ],
      // 表单参数
      purchaseForm: {
        id: undefined,
        demandQuantity: undefined, // 需求数量
        expectedDate: undefined, // 期望到货日期
        taskAssign: undefined, // 任务指派
        departmentId: undefined, // 指定部门
        principalId: undefined // 指定负责人
      },
      // 表单校验
      purchaseRules: {
        demandQuantity: { required: true, type: 'number', message: '需求数量不能为空', trigger: 'blur' },
        expectedDate: { required: true, type: 'date', message: '期望到货日期不能为空', trigger: 'change' },
        taskAssign: { required: true, message: '任务指派不能为空', trigger: 'change' },
        departmentId: { required: true, message: '指定部门不能为空', trigger: 'change' },
        principalId: { required: true, message: '指定负责人不能为空', trigger: 'change' }
      },
      // 发起出库弹出层参数
      // 弹出层标题
      initiateTitle: '',
      // 是否显示弹出层
      initiateOpen: false,
      // 表单参数
      initiateForm: {
        id: undefined,
        taskAssign: undefined, // 任务指派
        departmentId: undefined, // 指定部门
        principalId: undefined // 指定负责人
      },
      // 表单校验
      initiateRules: {
        taskAssign: { required: true, message: '任务指派不能为空', trigger: 'change' },
        departmentId: { required: true, message: '指定部门不能为空', trigger: 'change' },
        principalId: { required: true, message: '指定负责人不能为空', trigger: 'change' }
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
    this.getMaterialList()
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 物料列表 */
    getMaterialList() {
      getMatchMaterialList({
        brand: null,
        category: null,
        name: null
      }).then(response => {
        this.materialList = response.data
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getBomList(this.queryParams).then(response => {
        const { data } = response || []
        data.map(item => {
          item.status = this.bomStatusList.find(i => parseInt(i.value) === item.status).label
        })
        this.list = data;
        this.loading = false;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 重置采购表单 */
    resetPurchaseForm() {
      this.purchaseForm = {
        id: undefined,
        demandQuantity: undefined, // 需求数量
        expectedDate: undefined, // 期望到货日期
        taskAssign: undefined, // 任务指派
        departmentId: undefined, // 指定部门
        principalId: undefined // 指定负责人
      }
      this.resetForm('purchaseForm')
    },
    /** 发起采购 */
    bindPurchase() {
      this.$message.success('发起采购成功')
      this.purchaseTitle = '发起采购'
      this.purchaseOpen = true
      this.resetPurchaseForm()
    },
    /** 取消采购 */
    cancelPurchase() {
      this.purchaseOpen = false
      this.resetPurchaseForm()
    },
    /** 提交采购 */
    submitPurchase() {
      this.$refs.purchaseForm.validate((valid) => {
        if (valid) {
          this.$message.success('提交采购成功')
          this.purchaseOpen = false
          this.resetPurchaseForm()
        }
      })
    },
    /** 继续添加 */
    bindContinueAdd() {
      this.$message.success('继续添加成功')
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        search: undefined,
        name: undefined,
        demandQuantity: undefined // 需求数量
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
      this.$message.success('发起出库成功')
      this.initiateTitle = '发起出库'
      this.initiateOpen = true
      this.resetInitiateForm()
    },
    /** 删除按钮操作 */
    resetInitiateForm() {
      this.initiateForm = {
        id: undefined,
        taskAssign: undefined, // 任务指派
        departmentId: undefined, // 指定部门
        principalId: undefined // 指定负责人
      }
      this.resetForm('initiateForm')
    },
    /** 取消出库按钮操作 */
    cancelInitiate() {
      this.initiateOpen = false
      this.resetInitiateForm()
    },
    /** 提交出库按钮操作 */
    submitInitiate() {
      this.$refs.initiateForm.validate((valid) => {
        if (valid) {
          this.$message.success('提交出库成功')
          this.initiateOpen = false
          this.resetInitiateForm()
        }
      })
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
    /** 单选物料名称 */
    selectedChange(selection) {
      this.selectList = []
      if (selection.length > 1) {
        this.$refs.selectList.clearSelection();
        this.$refs.selectList.toggleRowSelection(selection[selection.length - 1]);
      }
      this.selectList = [selection[selection.length - 1]]
      console.log(this.selectList)
      this.form.name = this.selectList.length > 0 ? this.selectList[0].name : ''
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
// 隐藏表头的复选框
:deep(.el-table__header-wrapper .el-checkbox) {
  display: none;
}
</style>
