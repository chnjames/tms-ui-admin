<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-form :model="form" ref="infosRef" label-width="100px">
          <el-form-item label="名称">
            <el-input v-model="form.name" placeholder="请输入名称"/>
          </el-form-item>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-input v-model="form.username" placeholder="请输入负责人"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划起止日期">
              <el-date-picker v-model="form.createTime" style="width: 240px" value-format="yyyy-MM-dd"
                              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型">
              <div>{{ form.type }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内部关注人" prop="followerIds">
              <el-select v-model="form.followerIds" style="width: 100%" :multiple-limit="10" filterable multiple placeholder="请选择">
                <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname"
                           :value="parseInt(item.id)"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-form>
      </el-col>
      <el-col :span="8">
        ffff
      </el-col>
    </el-row>
    <el-tabs>
      <el-tab-pane label="任务描述" name="1">
        <!--<tinymce id="description" :height="300" placeholder="在这里输入文字" />-->
        <TinymceEditor placeholder="在这里输入文字" value="" :height="300" />
      </el-tab-pane>
      <el-tab-pane label="任务详情" name="2">
        <task-info />
      </el-tab-pane>
      <el-tab-pane label="文档附件" name="3">
        <doc-appendix />
      </el-tab-pane>
      <el-tab-pane label="BOM清单" name="4">
        <bom-list />
      </el-tab-pane>
      <el-tab-pane label="合同管理" name="5">
        <contract-manage />
      </el-tab-pane>
      <el-tab-pane label="收款管理" name="6">
        <pay-manage />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

import { listSimpleUsers } from '@/api/system/user'
import TinymceEditor from '@/components/TinymceEditor/index.vue'
import TaskInfo from '@/views/operations/details/components/TaskInfo.vue'
import DocAppendix from '@/views/operations/details/components/DocAppendix.vue'
import BomList from '@/views/operations/details/components/BomList.vue'
import ContractManage from '@/views/operations/details/components/ContractManage.vue'
import PayManage from '@/views/operations/details/components/PayManage.vue'

export default {
  name: 'Details',
  components: {
    PayManage,
    ContractManage,
    BomList,
    DocAppendix,
    TaskInfo,
    TinymceEditor
  },
  data() {
    return {
      // 用户列表
      userList: [],
      form: {
        name: 'WNC项目YOUITMS系统开发',
        username: '刘能',
        createTime: ['2019-01-01', '2022-10-01'],
        type: '项目管理',
        followerIds: [1, 2, 3]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    }
  }
}
</script>

<style scoped>

</style>
