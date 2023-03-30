<template>
  <div>
    <el-dialog :title="`${title}物料采购清单`" :visible.sync="open" width="900px" :append-to-body="appendToBody">
      <el-form ref="form" :model="form" :rules="rules" inline inline-message>
        <el-form-item v-if="form.action === 1 || form.action === 2" label="采购(PN)单号：" prop="pnCode">
          <div>{{form.pnCode}}</div>
        </el-form-item>
        <div class="flex-between">
          <el-form-item label="采购负责人：" prop="blameId">
            <el-select v-if="form.action === 0 || form.action === 1" v-model="form.blameId" placeholder="请选择采购负责人">
              <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                         :value="parseInt(item.id)"/>
            </el-select>
            <div v-else>{{form.blameName}}</div>
          </el-form-item>
          <el-button v-if="form.action === 0 || form.action === 1" type="primary" icon="el-icon-plus" @click="submitForm(1)">发起采购</el-button>
          <el-button v-else type="primary" :disabled="form.status !== 1" icon="el-icon-upload" size="mini" @click="bindContract">合同上传</el-button>
        </div>
        <el-divider />
        <el-table class="material" ref="materialRef" :show-summary="showSummary" :summary-method="getSumPrice" :data="form.items" style="width: 100%">
          <el-table-column label="物料编号" align="center" prop="materialCode" :width="100" />
          <el-table-column label="物料名称" align="center" prop="materialName" :width="100" />
          <el-table-column label="规格型号" align="center" prop="materialSpecs" :width="160" />
          <el-table-column label="品牌" align="center" prop="materialBrand" :width="100" />
          <el-table-column label="物料类别" align="center" prop="materialCategory" :width="100" />
          <el-table-column label="供应商" align="center" :width="160">
            <template v-slot="{row, $index}">
              <el-form-item :prop="`items.${$index}.supplierId`" :rules="rules.supplierId">
                <el-select v-if="form.action === 0 || form.action === 1" v-model="row.supplierId" placeholder="请选择">
                  <el-option v-for="(item, index) in supplierList" :key="index" :label="item.name" :value="item.id" />
                </el-select>
                <div v-else>{{row.supplierName}}</div>
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
              <el-form-item v-if="form.action === 0 || form.action === 1" :prop="`items.${$index}.price`" :rules="rules.price">
                <el-input v-model="row.price" placeholder="请输入" />
              </el-form-item>
              <div v-else>{{row.price}}</div>
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
      <template v-if="form.action === 0 || form.action === 1">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm(0)">保 存</el-button>
      </template>
      <el-button v-else @click="cancel">关 闭</el-button>
    </span>
    </el-dialog>
    <!-- 上传附件 -->
    <el-dialog :title="uploadTitle" :visible.sync="uploadOpen" width="600px" append-to-body>
      <file-upload multiple ref="fileUpload" :auto-upload="false" :is-show-tip="false" drag />
      <template slot="footer">
        <el-button type="primary" @click="submitUpload" :loading="uploadLoading">确 定</el-button>
        <el-button @click="cancelUpload">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listSimpleUsers } from '@/api/system/user'
import { createMaterialBuying, uploadContract, updateMaterialBuying } from '@/api/warehouse/materialBuying'
import { getSupplierSimpleList } from '@/api/config/supplier'
import FileUpload from '@/components/FileUpload/index.vue'

export default {
  name: 'materialTable',
  components: { FileUpload },
  props: {
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '900px'
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    open: {
      type: Boolean,
      default: false
    },
    transfer: {
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
      // 上传合同标题
      uploadTitle: '',
      // 上传合同是否显示弹出层
      uploadOpen: false,
      // 上传合同加载中
      uploadLoading: false,
      // 表单参数
      form: {
        blameId: null,
        action: null,
        id: null,
        items: [{
          demandId: null,
          price: null,
          supplierId: null
        }]
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
  watch: {
    transfer: {
      handler(val) {
        if (val) {
          val.blameName = this.userList.find(item => item.id === val.blameId)?.nickname;
          this.form = val;
          this.form.items.forEach(item => {
            item.supplierName = this.supplierList.find(sup => sup.id === item.supplierId)?.name;
            item.price = item.price || '';
            item.count = item.count || '';
            item.totalPrice = item.price * item.count;
          });
        }
      },
      deep: true
    }
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
    /** 表单重置 */
    reset() {
      this.form = {
        blameId: null,
        action: null,
        items: [{
          demandId: null,
          price: null,
          supplierId: null
        }]
      }
      this.resetForm("form");
    },
    /** 取消按钮 */
    cancel() {
      this.reset();
      this.$emit("cancel");
    },
    /** 提交按钮 */
    submitForm(type) {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        this.form.action = type;
        const params = {
          ...this.form,
          items: this.form.items.map(item => {
            return {
              demandId: item.demandId,
              price: item.price * 100,
              supplierId: item.supplierId
            }
          })
        }
        const requestFunction = this.form.id ? updateMaterialBuying : createMaterialBuying;
        requestFunction(params).then(() => {
          this.$modal.msgSuccess(type === 0 ? "保存成功" : "发起成功");
          this.$emit("success");
        });
      });
    },
    /** 合同上传 */
    bindContract() {
      this.uploadOpen = true
      this.uploadTitle = '添加'
    },
    /** 确定上传 */
    submitUpload() {
      this.uploadLoading = true
      const fileList = this.$refs.fileUpload.fileList
      if (fileList.length === 0) {
        this.$modal.msgError('请上传文件')
        return
      }
      fileList.forEach((item, index) => {
        const formData = new FormData()
        formData.append('file', item.raw)
        formData.append('id', this.form.id)
        uploadContract(formData).then(() => {
          if (index === fileList.length - 1) {
            this.uploadLoading = false
            this.uploadOpen = false
            this.$modal.msgSuccess('上传成功')
            this.form.status = 2
          }
        }).catch(() => {
          this.uploadLoading = false
          this.$modal.msgError('上传失败')
        })
      })
    },
    /** 取消上传 */
    cancelUpload() {
      this.uploadOpen = false
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

<style lang="scss" scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
.material {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
:deep(.el-upload) {
  width: 100%;
}
:deep(.el-upload-dragger) {
  height: 200px;
  width: 100%;
}
</style>
