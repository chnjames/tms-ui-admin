<template>
  <div class="app-container">
    <el-form :model="form" ref="infosRef" label-width="110px">
      <el-form-item label="名称:" class="item-name">
        <div v-if="!isEditing" class="item-name-flex">
          <div class="item-name-content">{{form.name}}</div>
          <i class="el-icon-edit" @click="bindIsEdit"></i>
        </div>
        <el-input v-else class="item-name-content" v-model="form.name" v-auto-focus="isEditing" @blur="bindSaveName" placeholder="请输入名称"/>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
            <el-col :span="12">
              <el-form-item label="负责人:" prop="blameId">
                <el-select v-model="form.blameId" style="width: 260px" filterable placeholder="请选择">
                  <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname" :value="parseInt(item.id)"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划起止日期:">
                <el-date-picker v-model="form.beginEndTime" style="width: 260px" value-format="timestamp"
                                type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务类型:">
                <div>{{ form.typeDesc }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内部关注人:" prop="followerIds">
                <el-select v-model="form.followerIds" collapse-tags style="width: 260px" :multiple-limit="10" filterable multiple placeholder="请选择">
                  <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname" :value="parseInt(item.id)"/>
                </el-select>
              </el-form-item>
            </el-col>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
          <div class="progress">
            <div>
              <div class="progress-label">当前进展</div>
              <div :style="{color: form.progressColor}">{{form.progress}}%</div>
            </div>
            <div>
              <div class="progress-label">已消耗工时(h)</div>
              <div>{{form.current}}</div>
            </div>
            <div>
              <div class="progress-label">预估工时(h)</div>
              <div>{{form.total}}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="(tab, i) in tabList" :key="`tab${i}`" :label="tab.label" :name="tab.name">
        <component v-if="activeTab === tab.name" v-bind:is="tab.component" :ref="tab.component" :content="tab.content" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

import {
getOverview,
updateOverview
} from '@/api/operations/overview'
import { listSimpleUsers } from '@/api/system/user'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import BomList from '@/views/operations/details/components/BomList.vue'
import ComTinymceEditor from '@/views/operations/details/components/ComTinymceEditor.vue'
import ContractManage from '@/views/operations/details/components/ContractManage.vue'
import DocAppendix from '@/views/operations/details/components/DocAppendix.vue'
import ExecuteRecord from '@/views/operations/details/components/ExecuteRecord.vue'
import PayManage from '@/views/operations/details/components/PayManage.vue'
import TaskInfo from '@/views/operations/details/components/TaskInfo.vue'
import TaskPlan from '@/views/operations/details/components/TaskPlan.vue'

export default {
  name: 'Details',
  components: {
    ComTinymceEditor,
    PayManage,
    ContractManage,
    BomList,
    DocAppendix,
    TaskInfo,
    TaskPlan,
    ExecuteRecord
  },
  data() {
    return {
      // 当前激活的tab
      activeTab: '1',
      // 名称可编辑状态
      isEditing: false,
      // tab列表 tabsType: 1: 设备维保 2: 项目管理 & 生产管理
      tabList: [
        { label: '任务描述', name: '1', component: 'ComTinymceEditor', content: '任务11111111111111描述' },
        { label: '任务计划', name: '7', component: 'TaskPlan', tabsType: 1 },
        { label: '执行记录', name: '8', component: 'ExecuteRecord', tabsType: 1 },
        { label: '任务详情', name: '2', component: 'TaskInfo', tabsType: 2 },
        { label: '文档附件', name: '3', component: 'DocAppendix' },
        { label: 'BOM清单', name: '4', component: 'BomList', tabsType: 2 },
        { label: '合同管理', name: '5', component: 'ContractManage', tabsType: 2 },
        { label: '收款管理', name: '6', component: 'PayManage', tabsType: 2 }
      ],
      // 用户列表
      userList: [],
      // 项目类型列表
      typeList: getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_TYPE),
      // 项目详情
      form: {
        name: undefined,
        blameId: undefined,
        beginTime: undefined,
        endTime: undefined,
        beginEndTime: [],
        type: undefined,
        typeDesc: undefined,
        followerIds: []
      }
    }
  },
  watch: {
    form: {
      handler(val) {
        // console.log(val)
      },
      deep: true
    }
  },
  async created() {
    await this.getUserList()
    await this.getOverview()
  },
  methods: {
    /** 用户列表 */
    getUserList() {
      listSimpleUsers().then(response => {
        this.userList = response.data
      })
    },
    /** 获取项目详情 */
    getOverview() {
      getOverview(this.$route.query.id).then(response => {
        const { data } = response
        data.blameId = data.blame.id
        data.followerIds = data.followers.map(item => item.id)
        data.typeDesc = this.typeList.find(type => parseInt(type.value) === data.type).label
        data.beginEndTime = [data.beginTime, data.endTime]
        data.current = data.rate.current
        data.total = data.rate.total
        data.progress = Math.floor((data.rate.current / data.rate.total) * 100)
        if (data.progress < 100) {
          if (data.endTime > new Date().getTime()) {
            data.progressColor = '#409EFF'
          } else {
            data.progressColor = '#F56C6C'
          }
        } else {
          if (data.endTime > new Date().getTime()) {
            data.progressColor = '#67C23A'
          } else {
            data.progressColor = '#909399'
          }
        }
        this.form = data
      })
    },
    /** 提交按钮 */
    updateOverview() {
      updateOverview(this.form).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
      })
    },
    /** 名称可编辑状态 */
    bindIsEdit() {
      this.isEditing = !this.isEditing
    },
    /** 失焦保存名称 */
    bindSaveName() {
      this.isEditing = false
    }
  }
}
</script>

<style lang="scss" scoped>
.item-name {
  :deep(.el-form-item__label) {
    font-size: 20px;
    font-weight: bold;
  }
  &-flex {
    display: flex;
    align-items: baseline;
  }
  &-content {
    font-size: 20px;
    font-weight: bold;
  }
  .el-icon-edit {
    margin-left: 10px;
    font-size: 20px;
    color: #409EFF;
    cursor: pointer;
  }
}
.progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  text-align: center;
  &-label {
    margin-bottom: 15px;
  }
}
</style>
