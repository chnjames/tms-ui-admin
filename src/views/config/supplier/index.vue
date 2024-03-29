<template>
  <div class="app-container">

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入公司名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:supplier:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="el-icon-download" size="mini" @click="handleDownload"
                   v-hasPermi="['config:supplier:export']">模板下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-upload accept=".xlsx, .xls" :action="upload.url" :headers="upload.headers" :show-file-list="false" :limit="1"
                   :on-success="handleFileSuccess">
          <el-button type="primary" plain icon="el-icon-upload2" size="mini" v-hasPermi="['config:supplier:export']">批量上传</el-button>
        </el-upload>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" :span-method="objectSpanMethod">
      <el-table-column label="公司名称" align="center" prop="name" />
      <el-table-column label="公司地址" align="center" prop="address" />
      <el-table-column label="联系人" align="center" prop="contactName" />
      <el-table-column label="联系电话" align="center" prop="contactMobile" />
      <el-table-column label="邮箱地址" align="center" prop="email" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['config:supplier:update']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['config:supplier:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="500" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="公司名称" prop="name">
          <el-select v-if="!isEdit" v-model="form.name" filterable allow-create default-first-option placeholder="请选择公司名称"
                     style="width: 100%" @change="bindSupplier">
            <el-option v-for="(item, index) in supplierList" :key="index" :label="item.name" :value="item.name"/>
          </el-select>
          <el-input v-else v-model="form.name" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="公司地址" prop="address">
          <el-input :disabled="isDisCompany&&!isEdit" v-model="form.address" placeholder="请输入公司地址" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactMobile" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="form.email" placeholder="请输入邮箱地址" />
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
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplier,
  getSupplierPage,
  getSupplierSimpleList,
  downloadSupplierTemplate} from "@/api/config/supplier";
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import { getBaseHeader } from '@/utils/request'

export default {
  name: "Supplier",
  components: {
    DrawerPlus
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 客户列表
      list: [],
      // 供应商精简列表
      supplierList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null
      },
      // 是否编辑
      isEdit: false,
      // 表单参数
      form: {
        supplierId: null,
        name: null,
        address: null,
        companyId: null,
        contactName: null,
        contactMobile: null,
        contactId: null,
        email: null
      },
      isDisCompany: false,
      // 表单校验
      rules: {
        name: [
          { required: true, message: "公司名称不能为空", trigger: "blur" },
          { max: 30, message: '公司名称不能超过30个字符', trigger: 'blur' }
        ],
        address: [
          { required: true, message: "公司地址不能为空", trigger: "blur" },
          { max: 50, message: '公司地址不能超过50个字符', trigger: 'blur' }
        ],
        contactName: [
          { required: true, message: "联系人不能为空", trigger: "blur" },
          { max: 30, message: '联系人不能超过30个字符', trigger: 'blur' }
        ],
        // contactMobile: [
        //   { required: true, message: "联系电话不能为空", trigger: "blur" },
        //   { pattern: /^1\d{10}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        // ],
        // email: [
        //   { required: true, message: "邮箱地址不能为空", trigger: "blur" },
        //   { pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/, message: '请输入正确的邮箱地址', trigger: 'blur' }
        // ]
      },
      // 导入模板
      upload: {
        url: process.env.VUE_APP_BASE_API + '/admin-api/config/supplier/import-excel',
        headers: getBaseHeader()
      }
    };
  },
  created() {
    this.getList();
    this.getSupplierSimpleList();
  },
  watch: {
    form: {
      handler(val) {
        const company = this.supplierList.find(item => item.name === val.name);
        val.companyId = company?.id || '';
        this.isDisCompany = !!(val.name && val.companyId);
      },
      deep: true
    }
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getSupplierPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 获取供应商精简信息列表 */
    getSupplierSimpleList() {
      getSupplierSimpleList().then(response => {
        this.supplierList = response.data;
      });
    },
    /** 选择供应商 */
    bindSupplier(val) {
      const company = this.supplierList.find(item => item.name === val);
      this.form.address = company?.address || '';
      this.form.companyId = company?.id || '';
      this.form.supplierId = company?.id || '';
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        supplierId: undefined,
        name: undefined,
        address: undefined,
        companyId: undefined,
        email: undefined,
        contactName: undefined,
        contactMobile: undefined,
        contactId: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isEdit = false;
      this.open = true;
      this.title = "添加客户";
    },
    /** 模板下载操作 */
    handleDownload() {
      downloadSupplierTemplate().then(res => {
        this.$download.excel(res, '供应商名册导入模版.xls');
      });
    },
    /** 批量上传操作 */
    /** 文件上传成功 */
    handleFileSuccess() {
      this.$modal.msgSuccess("导入成功");
      this.getList();
      this.getSupplierSimpleList();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isEdit = true;
      const params = {
        contactId: row.contactId,
        supplierId: row.supplierId
      };
      getSupplier(params).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改客户";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        // 修改的提交
        if (this.form.contactId != null) {
          updateSupplier(this.form).then(response => {
            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.getList();
            this.getSupplierSimpleList();
          });
          return;
        }
        // 添加的提交
        createSupplier(this.form).then(response => {
          this.$modal.msgSuccess("新增成功");
          this.open = false;
          this.getList();
          this.getSupplierSimpleList();
        });
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const name = row.contactName;
      const params = {
        contactId: row.contactId,
        supplierId: row.supplierId
      };
      this.$modal.confirm('是否确认删除联系人为"' + name + '"的数据项?').then(function() {
        return deleteSupplier(params);
      }).then(() => {
        this.getList();
        this.getSupplierSimpleList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 合并行 */
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex === 1) {
        const _row = (this.mergeColumn(this.list).one)[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    //判断合并行数
    mergeColumn(data) {
      const spanOneArr = []
      let concatOne = 0
      data.forEach((item, index) => {
        if (index === 0) {
          spanOneArr.push(1)
        } else {
          //name 修改
          if (item.supplierId === data[index - 1].supplierId) { //第一列需合并相同内容的字段
            spanOneArr[concatOne] += 1
            spanOneArr.push(0)
          } else {
            spanOneArr.push(1)
            concatOne = index
          }
        }
      })
      return {
        one: spanOneArr
      }
    }
  }
};
</script>
