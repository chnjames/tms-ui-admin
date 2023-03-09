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
        <div>
          <div>当前进展</div>
          <div>31%</div>
        </div>
        <div>
          <div>已消耗工时(h)</div>
          <div>311</div>
        </div>
        <div>
          <div>预估工时(h)</div>
          <div>805</div>
        </div>
      </el-col>
    </el-row>
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="(tab, i) in tabList" :key="`tab${i}`" :label="tab.label" :name="tab.name">
        <component v-if="activeTab === tab.name" v-bind:is="tab.component" :ref="tab.component" :value="tab.value" />
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
import TaskPlan from '@/views/operations/details/components/TaskPlan.vue'
import ExecuteRecord from '@/views/operations/details/components/ExecuteRecord.vue'
import DocMaterial from '@/views/operations/details/components/DocMaterial.vue'

export default {
  name: 'Details',
  components: {
    PayManage,
    ContractManage,
    BomList,
    DocAppendix,
    TaskInfo,
    TinymceEditor,
    TaskPlan,
    ExecuteRecord,
    DocMaterial
  },
  data() {
    return {
      // 当前激活的tab
      activeTab: '1',
      // tab列表 tabsType: 1: 设备维保 2: 项目管理 & 生产管理
      tabList: [
        { label: '任务描述', name: '1', component: 'TinymceEditor', value: '任务11111111111111描述' },
        { label: '任务计划', name: '7', component: 'TaskPlan', tabsType: 1 },
        { label: '执行记录', name: '8', component: 'ExecuteRecord', tabsType: 1 },
        { label: '文档资料', name: '9', component: 'DocMaterial', tabsType: 1 },
        { label: '任务详情', name: '2', component: 'TaskInfo', tabsType: 2 },
        { label: '文档附件', name: '3', component: 'DocAppendix', tabsType: 2 },
        { label: 'BOM清单', name: '4', component: 'BomList', tabsType: 2 },
        { label: '合同管理', name: '5', component: 'ContractManage', tabsType: 2 },
        { label: '收款管理', name: '6', component: 'PayManage', tabsType: 2 }
      ],
      // 用户列表
      userList: [],
      form: {
        name: 'WNC项目YOUITMS系统开发',
        username: '刘能',
        createTime: ['2019-01-01', '2022-10-01'],
        type: '项目管理',
        followerIds: [1]
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
