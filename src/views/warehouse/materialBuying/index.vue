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
        <el-button plain icon="el-icon-delete" size="mini" @click="handleDeleteBatch"
                   v-hasPermi="['warehouse:material-buying:delete']">批量删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table ref="materialRef" v-loading="loading" :data="list">
      <el-table-column type="selection" :selectable="compSelection" width="55" align="center"/>
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
      <el-table-column label="收货状态" align="center" prop="receivedStatus">
        <template v-slot="{row}">
          <el-tag v-if="row.receivedStatus" :type="row.receivedStatusType" size="small">{{row.receivedStatusDesc}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="{row}">
          <el-button :disabled="row.status !== 0" size="mini" type="text" icon="el-icon-edit" @click="handleDetail(row, 1)"
                     v-hasPermi="['warehouse:material-buying:update']">编辑</el-button>
          <el-button :disabled="row.status === 0" size="mini" type="text" icon="el-icon-edit" @click="handleDetail(row, 2)"
                     v-hasPermi="['warehouse:material-buying:update']">详情</el-button>
          <el-button :disabled="row.status !== 0" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(row)"
                     v-hasPermi="['warehouse:material-buying:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <material-table ref="materialTableRef" :title="title" :open="open" :transfer="transfer" @cancel="cancel" @success="submitForm" />
  </div>
</template>

<script>
import {
  getPurchasePage,
  deleteMaterialBuying,
  getPurchase } from '@/api/warehouse/materialBuying'
import { listSimpleUsers } from '@/api/system/user'
import MaterialTable from '@/views/warehouse/components/materialTable.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

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
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        blameId: null,
        createTime: null
      },
      // 传递给子组件的参数
      transfer: null,
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.WAREHOUSE_BUYING_STATUS),
      receivedStatusDictDatas: getDictDatas(DICT_TYPE.WAREHOUSE_BUYING_RECEIVED_STATUS)
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
          item.statusDesc = this.statusDictDatas.find(i => parseInt(i.value) === item.status).label
          item.statusType = this.statusDictDatas.find(i => parseInt(i.value) === item.status).colorType
          if (item.receivedStatus !== '' && item.receivedStatus !== null) {
            item.receivedStatusDesc = this.receivedStatusDictDatas.find(i => parseInt(i.value) === item.receivedStatus).label
            item.receivedStatusType = this.receivedStatusDictDatas.find(i => parseInt(i.value) === item.receivedStatus).colorType
          }
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
      this.getList();
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
          item.historyPrice = item.materialAvg.avg / 100;
        })
        this.transfer = {
          blameId: data.blameId,
          pnCode: data.pnCode,
          status: data.status,
          id: data.id,
          action: type,
          items: data.items
        };
        this.title = type === 1 ? "编辑" : "查看";
        this.open = true;
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.open = false;
      this.getList();
    },
    /** 限制list列表多选 */
    compSelection(row) {
      return row.status === 0;
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch() {
      const ids = this.$refs.materialRef.selection.map(item => item.id).join(',');
      if (ids.length === 0) {
        this.$modal.msgWarning("请选择要删除的数据项");
        return;
      }
      this.$modal.confirm('是否确认删除选中的数据项?').then(function() {
        return deleteMaterialBuying(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
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
