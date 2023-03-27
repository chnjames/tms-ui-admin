<template>
  <div class="app-container">

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item prop="brand">
        <el-select v-model="queryParams.brand" placeholder="选择物料品牌" clearable @clear="bindBrandClear">
          <el-option v-for="(item, index) in brandList" :key="index" :label="item.brand" :value="item.brand" />
        </el-select>
      </el-form-item>
      <el-form-item prop="category">
        <el-select v-model="queryParams.category" placeholder="选择物料类别" clearable @clear="bindCategoryClear">
          <el-option v-for="(item, index) in categoryList" :key="index" :label="item.category" :value="item.category" />
        </el-select>
      </el-form-item>
      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入物料名称/编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleCreatePurchase"
                   v-hasPermi="['warehouse:material:create']">创建采购单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['warehouse:material:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table ref="materialDemandRef" v-loading="loading" :data="list">
      <el-table-column type="selection" :selectable="compSelection" width="55" align="center"/>
      <el-table-column label="物料编号" align="center" prop="materialCode" />
      <el-table-column label="物料名称" align="center" prop="materialName" />
      <el-table-column label="规格型号" align="center" prop="materialSpecs" />
      <el-table-column label="品牌" align="center" prop="materialBrand" />
      <el-table-column label="物料类别" align="center" prop="materialCategory" />
      <el-table-column label="需求数量" align="center" prop="count" />
      <el-table-column label="需求发起人" align="center">
        <template v-slot="{row}">
          <span>{{row.creator.nickname || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template v-slot="{row}">
          <span class="status" :class="row.statusColor">{{row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="需求发起时间" align="center">
        <template v-slot="{row}">
          <span>{{ parseTime(row.createTime)}}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
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
  </div>
</template>

<script>
import {
  getBrandList,
  getCategoryList,
  getSpecList,
  exportMaterialExcel,
  getDemandPage
} from '@/api/warehouse/material'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { getSupplierSimpleList } from '@/api/config/supplier'
import { getMaterialBuyingAvgPrice, createMaterialBuying } from '@/api/warehouse/materialBuying'
import store from '@/store'
import { listSimpleUsers } from '@/api/system/user'

export default {
  name: "MaterialDemand",
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
      // 品牌列表
      brandList: [],
      // 类别列表
      categoryList: [],
      // 规格型号列表
      specList: [],
      // 供应商列表
      supplierList: [],
      // 用户列表
      userList: [],
      // 物料需求状态列表
      statusList: getDictDatas(DICT_TYPE.WAREHOUSE_MATERIAL_DEMAND_STATUS),
      // 是否只读
      isReadonly: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        brand: null,
        category: null
      },
      // 物料ID列表
      ids: null,
      // 是否合并计算
      showSummary: true,
      // 表单参数
      form: {
        blameId: null,
        action: null,
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
    };
  },
  watch: {
    form: {
      handler(val) {
        val.items.forEach(item => {
          item.price = item.price || '';
          item.count = item.count || '';
          item.totalPrice = item.price * item.count;
        });
        this.showSummary = false;
        this.$nextTick().then(() => {
          this.showSummary = true;
        })
      },
      deep: true
    }
  },
  created() {
    this.getList();
    this.getBrandList();
    this.getCategoryList();
    this.getSpecList();
    this.getSupplierSimpleList();
    this.getUserList();
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 品牌列表 */
    getBrandList() {
      getBrandList().then(response => {
        this.brandList = response.data;
      });
    },
    /** 类别列表 */
    getCategoryList() {
      getCategoryList().then(response => {
        this.categoryList = response.data;
      });
    },
    /** 规格型号列表 */
    getSpecList() {
      getSpecList().then(response => {
        this.specList = response.data;
      });
    },
    /** 获取供应商精简信息列表 */
    getSupplierSimpleList() {
      getSupplierSimpleList().then(response => {
        this.supplierList = response.data;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getDemandPage(this.queryParams).then(response => {
        const { list, total } = response.data;
        const statusLookup = this.statusList.reduce((lookup, status) => {
          lookup[status.value] = {
            label: status.label,
            color: status.colorType
          };
          return lookup;
        }, {});
        list.forEach(item => {
          const {label, color} = statusLookup[item.status];
          item.statusName = label;
          item.statusColor = color;
        });
        this.list = list;
        this.total = total;
        this.loading = false;
      });
    },
    /** 限制list列表多选 */
    compSelection(row) {
      return row.status === 0;
    },
    /** 清除品牌 */
    bindBrandClear() {
      this.queryParams.brand = null
    },
    /** 清除类别 */
    bindCategoryClear() {
      this.queryParams.category = null
    },
    querySearch(queryString, cb) {
      const specs = this.specList;
      const results = queryString ? specs.filter(this.createFilter(queryString)) : specs;
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.specs.indexOf(queryString) === 0);
      };
    },
    handleSelect(item) {
      console.log(item);
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
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
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 创建采购单按钮操作 */
    handleCreatePurchase() {
      const arr = this.$refs.materialDemandRef.selection;
      if (arr.length === 0) {
        this.$modal.msgWarning("请选择物料");
        return;
      }
      this.ids = arr.map(item => item.id).join(",")
      this.getMaterialBuyingAvgPrice();
    },
    /** 获得物料采购均价 */
    getMaterialBuyingAvgPrice() {
      getMaterialBuyingAvgPrice({
        demandIds: this.ids
      }).then(response => {
        const { data } = response;
        data.map(item => {
          item.materialCode = item.materialAvg.material.code;
          item.materialName = item.materialAvg.material.name;
          item.materialSpecs = item.materialAvg.material.specs;
          item.materialBrand = item.materialAvg.material.brand;
          item.materialCategory = item.materialAvg.material.category;
          item.demander = item.demander.nickname;
          item.historyPrice = item.materialAvg.avg;
        });
        const userId = store.getters.userId;
        this.form = {
          blameId: userId,
          action: 0,
          items: data
        };
        this.open = true;
        this.title = "编辑物料采购清单";
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
    /** 提交按钮 */
    submitForm(type) {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        this.form.action = type;
        createMaterialBuying(this.form).then(() => {
          this.$modal.msgSuccess(type === 0 ? "保存成功" : "发起成功");
          this.open = false;
          this.getList();
        });
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      this.$modal.confirm('是否确认导出所有物料基础数据数据项?').then(() => {
        this.exportLoading = true;
        return exportMaterialExcel(params);
      }).then(response => {
        this.$download.excel(response, '物料基础数据.xls');
        this.exportLoading = false;
      }).catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.status {
  &.danger {
    color: #f56c6c;
  }
  &.info {
    color: #909399;
  }
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
