<template>
  <!-- 列表 -->
  <el-table v-loading="loading" :data="list">
    <el-table-column
      v-for="(item, index) in tableHeader"
      :key="index"
      :prop="item.prop"
      :width="item.width"
      :fixed="item.fixed"
      :align="item.align"
      :label="item.label">
      <template v-slot="{row}">
        <template v-if="item.prop === 'updateTime'">
          <span>{{ parseTime(row[item.prop]) }}</span>
        </template>
        <template v-else-if="item.prop === 'attachment'">
          <el-image fit="cover" style="width: 50px;height: 50px" :preview-src-list="['https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg']" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" />
        </template>
        <span v-else>{{ row[item.prop] }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { listSimpleUsers } from '@/api/system/user'
import { getCustomerPage } from '@/api/config/customer'

export default {
  name: 'ExecuteRecord',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 执行记录列表
      list: [],
      // 查询参数
      queryParams: {
        name: null,
        pageNo: 1,
        pageSize: 10
      },
      // 表头
      tableHeader: [
        { prop: 'name', label: '任务名称' },
        { prop: 'contactName', label: '执行人' },
        { prop: 'name', label: '状态' },
        { prop: 'updateTime', label: '触发时间' },
        { prop: 'updateTime', label: '开始时间' },
        { prop: 'updateTime', label: '结束时间' },
        { prop: 'attachment', label: '附件' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getCustomerPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.loading = false;
      });
    },
  }
}
</script>

<style scoped>

</style>
