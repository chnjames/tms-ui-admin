<template>
  <div class="container">
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
          <template v-if="item.prop === 'status'">
            <el-tag size="mini" :type="row.statusColor">{{row.statusDesc}}</el-tag>
          </template>
          <template v-else-if="item.prop === 'createTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <template v-else-if="item.prop === 'activatedTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <template v-else-if="item.prop === 'completedTime'">
            <span>{{ parseTime(row[item.prop]) }}</span>
          </template>
          <template v-else-if="item.prop === 'attachment'">
            <el-image v-if="row.attachments" fit="cover" style="width: 50px;height: 50px" :preview-src-list="row.attachments" :src="row.attachment" />
          </template>
          <span v-else>{{ row[item.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList"/>
  </div>
</template>

<script>
import { getTaskPage } from '@/api/operations/overview'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'ExecuteRecord',
  data() {
    return {
      // 任务状态列表
      taskStatusList: getDictDatas(DICT_TYPE.OPERATIONS_TASK_STATUS),
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 执行记录列表
      list: [],
      // 查询参数
      queryParams: {
        projectId: null,
        pageNo: 1,
        pageSize: 10
      },
      // 表头
      tableHeader: [
        { prop: 'name', label: '任务名称', width: 300 },
        { prop: 'blameName', label: '执行人' },
        { prop: 'status', label: '状态' },
        { prop: 'createTime', label: '触发时间' },
        { prop: 'activatedTime', label: '激活时间' },
        { prop: 'completedTime', label: '完成时间' },
        { prop: 'attachment', label: '附件' }
      ]
    }
  },
  created() {
    this.getList()
  },
  computed: {
    proId() {
      return this.$route.query.id
    },
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      this.queryParams.projectId = this.proId
      getTaskPage(this.queryParams).then(response => {
        const { list, total } = response.data
        list.map(item => {
          item.blameName = item.blame?.nickname || '-'
          item.statusDesc = this.taskStatusList.find(i => parseInt(i.value) === item.status).label
          item.statusColor = this.taskStatusList.find(i => parseInt(i.value) === item.status).colorType
          if (item.attachments && item.attachments.length > 0) {
            const [attachment] = item.attachments
            item.attachment = attachment
          } else {
            item.attachment = null
          }
        })
        this.list = list;
        this.total = total;
        this.loading = false;
        this.loading = false;
      });
    },
  }
}
</script>

<style scoped>

</style>
