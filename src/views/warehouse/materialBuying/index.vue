<template>
  <div class="app-container">

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="blameId">
        <el-select v-model="queryParams.blameId" placeholder="选择采购负责人" clearable @clear="bindBlameClear">
          <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname" :value="parseInt(item.id)"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime">
        <el-date-picker v-model="queryParams.createTime" value-format="timestamp"
                        type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button plain icon="el-icon-delete" size="mini" v-hasPermi="['config:device:create']">批量删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="采购(PN)单号" align="center" prop="pnCode" />
      <el-table-column label="采购总金额" align="center" prop="totalPrice" />
      <el-table-column label="采购负责人" align="center">
        <template v-slot="{row}">
          <span>{{row.creator.nickname || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="采购发起时间" align="center">
        <template v-slot="{row}">
          <span>{{ parseTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采购合同" align="center" prop="status">
        <template v-slot="{row}">
          <el-tag :type="row.statusType" size="small">{{row.statusDesc}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="{row}">
          <el-button :disabled="row.status !== 0" size="mini" type="text" icon="el-icon-edit" @click="handleDetail(row, 1)"
                     v-hasPermi="['warehouse:material:update']">编辑</el-button>
          <el-button :disabled="row.status === 0" size="mini" type="text" icon="el-icon-edit" @click="handleDetail(row, 2)"
                     v-hasPermi="['warehouse:material:update']">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                     v-hasPermi="['warehouse:material:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <material-table ref="materialTableRef" :title="title" :open="open" :transfer="transfer" @cancel="cancel" @submit="submitForm" />
  </div>
</template>

<script>
import {
  getPurchasePage,
  deleteMaterialBuying,
  getPurchase } from '@/api/warehouse/materialBuying'
import { listSimpleUsers } from '@/api/system/user'
import MaterialTable from '@/views/warehouse/components/materialTable.vue'

export default {
  name: "MaterialBuying",
  components: { MaterialTable },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 物料基础数据列表
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 用户列表
      userList: [],
      // 采购状态列表
      materialBuyList: [
        { label: "未发起采购", value: 0, type: 'warning' },
        { label: "未上传合同", value: 1, type: 'danger' },
        { label: "已上传合同", value: 2, type: 'success' }
      ],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        blameId: null,
        createTime: null
      },
      // 传递给子组件的参数
      transfer: null
    };
  },
  created() {
    this.getUserList();
    this.getList();
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getPurchasePage(this.queryParams).then(response => {
        const { list, total } = response.data;
        list.map(item => {
          item.statusDesc = this.materialBuyList.find(i => i.value === item.status).label
          item.statusType = this.materialBuyList.find(i => i.value === item.status).type
          item.totalPrice = item.items.reduce((total, item) => {
            return total + item.price * item.count
          }, 0) / 100
        });
        this.list = list;
        this.total = total;
        this.loading = false;
      });
    },
    /** 清除采购负责人 */
    bindBlameClear() {
      this.queryParams.blameId = null
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 详情按钮操作 */
    handleDetail(row, type) {
      getPurchase({ id: row.id }).then(response => {
        const data = response.data
        data.items.map(item => {
          item.price = item.price / 100;
          item.materialCode = item.materialAvg.material.code;
          item.materialName = item.materialAvg.material.name;
          item.materialSpecs = item.materialAvg.material.specs;
          item.materialBrand = item.materialAvg.material.brand;
          item.materialCategory = item.materialAvg.material.category;
          item.demander = item.demander.nickname;
          item.historyPrice = item.materialAvg.avg;
        })
        this.transfer = {
          blameId: data.blameId,
          action: type,
          items: data.items
        };
        this.title = type === 1 ? "编辑" : "查看";
        this.open = true;
      })
    },
    /** 提交按钮 */
    submitForm() {

    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      const pnCode = row.pnCode;
      this.$modal.confirm('是否确认删除采购(PN)单号为"' + pnCode + '"的数据项?').then(function() {
        return deleteMaterialBuying(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.material {
  :deep(.el-upload) {
    width: 100%;
  }
  :deep(.el-upload-dragger) {
    height: 200px;
    width: 100%;
  }
}
</style>
