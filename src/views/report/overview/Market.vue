<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item>
        <el-select v-model="queryParams.type" placeholder="类型">
          <el-option v-for="item in menuOptions" :key="item.type" :label="item.name" :value="item.type"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-if="queryParams.type === 1" v-model="queryParams.customerName" placeholder="请选择" @change="handleQuery">
          <el-option v-for="item in customerList" :key="item.id" :label="item.customerName" :value="item.customerName"/>
        </el-select>
        <el-input v-if="queryParams.type === 2" v-model="queryParams.projectName" placeholder="请输入" clearable @keyup.enter.native="handleQuery"/>
        <el-select v-if="queryParams.type === 3" v-model="queryParams.blameId" placeholder="请选择" @change="handleQuery">
          <el-option v-for="item in userList" :key="item.id" :label="item.nickname" :value="item.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleQuery"
          :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button plain size="mini" @click="handleBack">返回</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" show-summary :summary-method="getSummaries">
      <el-table-column label="客户名称" prop="contactName"/>
      <el-table-column label="项目名称" prop="projectName" width="250"/>
      <el-table-column label="合同金额" prop="totalAmount">
        <template v-slot="{ row }">
          <span>{{row.totalAmountDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="已收款金额" prop="receivedAmount">
        <template v-slot="{ row }">
          <span>{{row.receivedAmountDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="待收金额" prop="timeoutAmount">
        <template v-slot="{ row }">
          <span>{{row.timeoutAmountDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column label="销售负责人" prop="blameName"/>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import { getSalesOverview } from '@/api/report/operations'
import { listSimpleUsers } from '@/api/system/user'
import { getCustomerContactSimpleList } from '@/api/config/customer'
import { getProjectSimpleList } from '@/api/operations/overview'
import { formatMoney } from '@/utils'
export default {
  name: 'Market',
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 类型选项
      menuOptions: [{
        type: 1,
        name: '客户名称'
      }, {
        type: 2,
        name: '项目名称'
      }, {
        type: 3,
        name: '销售负责人'
      }],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 销售列表
      list: [],
      // 用户列表
      userList: [],
      // 联系人列表
      customerList: [],
      // 项目列表
      projectList: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        type: 1,
        customerName: null, // 客户名称
        projectName: null, // 项目名称
        blameId: null, // 销售负责人
        createTime: null
      }
    }
  },
  async mounted() {
    // 获取负责人列表 联系人列表 项目列表
    const [userListData, customerContactListData, projectListData] = await Promise.all([listSimpleUsers(), getCustomerContactSimpleList(), getProjectSimpleList()])
    this.userList = userListData.data
    this.customerList = customerContactListData.data
    this.projectList = projectListData.data
    await this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 执行查询
      getSalesOverview(this.queryParams).then(response => {
        const {list, total} = response.data
        list.map(item => {
          item.contactName = this.customerList.find(i => i.id === item.contactId)?.customerName || ''
          item.projectName = this.projectList.find(i => i.id === item.projectId)?.name || ''
          item.totalAmountDesc = formatMoney(item.totalAmount / 100 ?? 0)
          item.receivedAmountDesc = formatMoney(item.receivedAmount / 100 ?? 0)
          item.timeoutAmountDesc = formatMoney(item.timeoutAmount / 100 ?? 0)
          item.blameName = this.userList.find(i => i.id === item.blameId)?.nickname || ''
        })
        this.list = list
        this.total = total
        this.loading = false
      })
    },
    /** 合计 */
    getSummaries(param) {
      const { columns, data } = param;
      // 计算合计
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (column.property === 'contactName' || column.property === 'projectName' || column.property === 'blameName') {
          sums[index] = '';
        } else {
          sums[index] = data.reduce((prev, curr) => {
            const value = Number(curr[column.property]);
            if (!isNaN(value)) {
              return prev + curr[column.property];
            } else {
              return prev;
            }
          }, 0);
          sums[index] = formatMoney(sums[index] / 100);
        }
      });
      return sums;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 返回按钮操作 */
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>
