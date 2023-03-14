<template>
  <div>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['config:factory-area:create']">编辑</el-button>
      </el-col>
      <right-toolbar @queryTable="getReceipt"></right-toolbar>
    </el-row>
    <!--基本/收款信息-->
    <el-row>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">基本信息</div>
          <div>合同总金额(RMB)：1000,000</div>
          <div>收款负责人：刘能</div>
          <div>联系人(客户)：陈逸飞</div>
          <div>客户所在公司：XXXX制作有限公司</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">收款信息</div>
          <el-steps direction="vertical" :active="1" :space="80">
            <el-step :title="activity.content" :description="activity.timestamp" v-for="(activity, index) in activities" :key="index"></el-step>
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
    <!-- 对话框(添加 / 修改) -->
    <drawer-plus :title="title" :visible.sync="open" :size="600" append-to-body>
      <el-form class="form" ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="联系人" prop="contactId">
          <el-select v-model="form.contactId" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="公司名称">
          <div>金属制品有限公司</div>
        </el-form-item>
        <el-form-item label="合同总金额(¥)" prop="amount">
          <el-input-number placeholder="请输入" v-model="form.amount" controls-position="right" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="收款负责人" prop="blameId">
          <el-select v-model="form.blameId" style="width: 100%" filterable placeholder="请选择">
            <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                       :value="parseInt(item.id)"/>
          </el-select>
        </el-form-item>
        <el-card shadow="never" v-for="(item, index) in form.items" :key="index">
          <el-row :gutter="10" type="flex" justify="space-between">
            <el-col :span="23">
              <el-form-item :label="`收款名目${index+1}`" :prop="'items.'+ index + '.title'" :rules="rules.title">
                <el-input v-model="item.title" placeholder="请输入" style="width: 100%"></el-input>
              </el-form-item>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="收款日期" :prop="'items.'+ index + '.startTime'" :rules="rules.startTime">
                    <el-date-picker clearable v-model="item.startTime" type="date" value-format="timestamp" style="width: 100%" placeholder="请选择" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="收款比例" :prop="'items.'+ index + '.scale'" :rules="rules.scale">
                    <el-input-number placeholder="请输入" v-model="item.scale" controls-position="right" :min="0" :max="100" style="width: 100%"></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <i class="outer el-icon-delete" v-if="form.items.length > 1" @click="deleteItems(item, index)"></i>
          </el-row>
        </el-card>
        <el-button type="primary" plain icon="el-icon-plus" @click="addItems" style="width: 100%">添 加</el-button>
      </el-form>
      <template slot="footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </drawer-plus>
  </div>
</template>

<script>
import { createReceipt, getReceipt } from '@/api/operations/overview'
import { listSimpleUsers } from '@/api/system/user'
import DrawerPlus from '@/components/DrawerPlus/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'

export default {
  name: 'PayManage',
  components: { FileUpload, DrawerPlus },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 任务详情列表
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 用户列表
      userList: [],
      // 流程列表
      activities: [{
        content: '首付款',
        timestamp: '2022/11/21 30% 300,000'
      }, {
        content: '首付款',
        timestamp: '2022/11/21 30% 300,000'
      }, {
        content: '首付款',
        timestamp: '2022/11/21 30% 300,000'
      }, {
        content: '首付款',
        timestamp: '2022/11/21 30% 300,000'
      }],
      // 查询参数
      queryParams: {
        name: null,
        pageNo: 1,
        pageSize: 10
      },
      // 表单参数
      form: {
        id: undefined,
        contactId: undefined, // 联系人
        amount: undefined, // 合同总金额
        blameId: undefined, // 收款负责人
        items: [{
          title: undefined,
          startTime: undefined,
          scale: undefined,
          amount: undefined
        }]
      },
      // 表单校验
      rules: {
        contactId: { required: true, message: '请选择联系人', trigger: 'change'},
        amount: { required: true, type: 'number', message: '请输入合同总金额', trigger: 'blur'},
        title: { required: true, message: '请输入收款名目', trigger: 'blur'},
        startTime: { required: true, message: '请选择收款日期', trigger: 'change'},
        scale: { required: true, type: 'number', message: '请输入收款比例', trigger: 'blur'}
      }
    }
  },
  created() {
    this.getUserList()
    this.getReceipt()
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 获取收款管理详情 */
    getReceipt() {
      getReceipt(this.$route.query.id).then(response => {
        this.form = response.data
      })
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
        contactId: undefined, // 联系人
        amount: undefined, // 合同总金额
        blameId: undefined, // 收款负责人
        items: [{
          title: undefined,
          startTime: undefined,
          scale: undefined,
          amount: undefined
        }]
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getReceipt()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加'
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        // 修改的提交
        createReceipt(this.form).then(response => {
          this.$modal.msgSuccess('修改成功')
          this.open = false
          this.getReceipt()
        })
      })
    },
    /** 删除收款名目 */
    deleteItems(item, index) {
      this.form.items.splice(index, 1)
    },
    /** 添加收款名目 */
    addItems() {
      this.form.items.push({
        title: undefined,
        startTime: undefined,
        scale: undefined,
        amount: undefined
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.form {
  .el-form-item {
    margin-bottom: 20px;
  }
  .el-card {
    margin-bottom: 20px;
    :deep(.el-card__body) {
      padding: 15px 20px 0 0;
    }
  }
  .outer {
    color: #F56C6C;
    font-size: 16px;
    top: 8px;
    right: 8px;
  }
}
</style>
