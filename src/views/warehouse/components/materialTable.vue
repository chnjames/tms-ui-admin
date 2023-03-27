<template>
  <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" inline>
      <div class="flex-between">
        <el-form-item label="采购负责人" prop="blameId">
          <el-select v-model="form.blameId" style="width: 100%" placeholder="请选择采购负责人">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="submitForm(1)">发起采购</el-button>
      </div>
      <el-divider />
      <el-table ref="materialRef" :show-summary="showSummary" :summary-method="getSumPrice" :data="form.items" style="width: 100%">
        <el-table-column label="物料编号" align="center" prop="materialCode" :width="100" />
        <el-table-column label="物料名称" align="center" prop="materialName" :width="100" />
        <el-table-column label="规格型号" align="center" prop="materialSpecs" :width="160" />
        <el-table-column label="品牌" align="center" prop="materialBrand" :width="100" />
        <el-table-column label="物料类别" align="center" prop="materialCategory" :width="100" />
        <el-table-column label="供应商" align="center" :width="160">
          <template v-slot="{row, $index}">
            <el-form-item :prop="`items.${$index}.supplierId`" :rules="rules.supplierId">
              <el-select v-model="row.supplierId" placeholder="请选择">
                <el-option v-for="(item, index) in supplierList" :key="index" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="需求发起人" align="center" :width="100">
          <template v-slot="{row}">
            <span>{{row.demander || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="历史平均价格" align="center" :width="100">
          <template v-slot="{row}">
            <span>{{row.historyPrice || '-'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="单购价格" align="center" :width="140">
          <template v-slot="{row, $index}">
            <el-form-item :prop="`items.${$index}.price`" :rules="rules.price">
              <el-input v-model="row.price" placeholder="请输入" />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="需求数量" align="center" prop="count" :width="100" />
        <el-table-column label="总价" align="center" prop="totalPrice" :width="120">
          <template v-slot="{row}">
            <span>{{row.totalPrice}}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm(0)">保 存</el-button>
      </span>
  </el-dialog>
</template>

<script>
import { listSimpleUsers } from '@/api/system/user'
import { createMaterialBuying } from '@/api/warehouse/materialBuying'
import { getSupplierSimpleList } from '@/api/config/supplier'

export default {
  name: 'materialTable',
  props: {
    type: {
      type: String,
      default: '' // 0：创建 1：编辑 2：详情
    },
    title: {
      type: String,
      default: ''
    },
    open: {
      type: Boolean,
      default: false
    },
    transferData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      // 用户列表
      userList: [],
      // 供应商列表
      supplierList: [],
      // 是否合并计算
      showSummary: true,
      // 表单参数
      form: {
        blameId: null,
        action: null,
        items: [
          {
            demandId: null,
            price: null,
            supplierId: null
          }
        ]
      },
      // 表单校验
      rules: {
        blameId: { required: true, message: "责任人不能为空", trigger: "change" },
        supplierId: { required: true, message: "供应商不能为空", trigger: "change" },
        price: { required: true, message: "单购价格不能为空", trigger: "blur" }
      }
    }
  },
  created() {
    this.getUserList();
    this.getSupplierSimpleList();
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 获取供应商精简信息列表 */
    getSupplierSimpleList() {
      getSupplierSimpleList().then(response => {
        this.supplierList = response.data;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.$emit("cancel");
    },
    /** 提交按钮 */
    submitForm(type) {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        this.form.action = type;
        createMaterialBuying(this.form).then(() => {
          this.$modal.msgSuccess(type === 0 ? "保存成功" : "发起成功");
          this.$emit("success");
        });
      });
    },
    /** 表尾合计 */
    getSumPrice(param) {
      const { columns, data } = param
      const len = columns.length
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
        } else if (index === len - 1 || index === len - 2) {
          const values = data.map(item => Number(item[column.property]))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
          } else {
            sums[index] = 'N/A'
          }
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
  }
}
</script>

<style scoped>

</style>
