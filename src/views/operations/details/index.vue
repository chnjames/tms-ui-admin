<template>
  <div class="app-container">
    <el-form :model="form" ref="infosRef" label-width="110px">
      <el-form-item label="名称:" class="item-name">
        <div class="item-name-flex">
          <div v-if="!isEditing" class="item-name-content cursor" @click="bindIsEdit">{{form.name}}</div>
          <el-input v-else class="item-name-content" v-model="form.name" v-auto-focus="isEditing" @blur="bindSaveName" placeholder="请输入名称"/>
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button round size="mini" plain :type="form.colorType">进行中 <i class="el-icon-arrow-down"></i></el-button>
            <el-dropdown-menu slot="dropdown">
              <div class="dropdown-title">更改项目状态</div>
              <el-dropdown-item v-for="item in statusList" :key="item.value" :command="item.value">
                <el-button round plain size="mini" :type="item.colorType">{{item.label}}</el-button>
                <i class="el-icon-check" v-if="form.status === parseInt(item.value)"></i>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :md="16" :xs="24">
          <el-col :span="12">
            <el-form-item label="负责人:" prop="blameId">
              <el-select v-model="form.blameId" style="width: 100%;max-width: 300px" filterable placeholder="请选择">
                <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname" :value="parseInt(item.id)"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划起止日期:">
              <el-date-picker v-model="form.beginEndTime" style="width: 100%;max-width: 300px" value-format="timestamp"
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
              <el-select v-model="form.followerIds" collapse-tags style="width: 100%;max-width: 300px" :multiple-limit="10" filterable multiple placeholder="请选择">
                <el-option v-for="item in userList" :key="parseInt(item.id)" :label="item.nickname" :value="parseInt(item.id)"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :md="8" :xs="24">
          <div class="progress">
            <el-col :span="8">
              <div class="progress-label">当前进展</div>
              <count-to :style="{color: form.progressColor}" :start-val="0" :end-val="form.progress" suffix="%" />
            </el-col>
            <el-col :span="8">
              <div class="progress-label">已消耗工时(h)</div>
              <count-to :start-val="0" :end-val="form.current" />
            </el-col>
            <el-col :span="8">
              <div class="progress-label">预估工时(h)</div>
              <count-to :start-val="0" :end-val="form.total" />
            </el-col>
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
import CountTo from 'vue-count-to'
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
    CountTo,
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
      // tab列表
      tabList: [],
      // tab列表 tabsType: 1: 设备维保 2: 项目管理 & 生产管理
      tabsList: [
        { label: '任务描述', name: '1', component: 'ComTinymceEditor', content: '' },
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
      // 项目状态列表
      statusList: [],
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
        if (val.name || val.status || val.blameId || val.beginEndTime || val.followerIds) {
          if (val.beginEndTime) {
            [val.beginTime, val.endTime] = val.beginEndTime;
          } else {
            val.beginTime = undefined;
            val.endTime = undefined;
          }
          // this.updateOverview()
        }
      },
      deep: true
    }
  },
  async created() {
    this.statusList = await this.getDictDatas(DICT_TYPE.OPERATIONS_PROJECT_STATUS)
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
        data.colorType = this.statusList.find(status => parseInt(status.value) === data.status).colorType
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
        const {id, type} = this.$route.query
        console.log(id, type)
        this.tabList = this.tabsList.filter(tab => (
          !tab.tabsType || tab.tabsType === parseInt(type)
        ))
        this.tabList.find(tab => tab.name === '1').content = data.description
      })
    },
    /** 下拉菜单切换 */
    handleCommand(command) {
      this.form.status = command
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
    align-items: center;
  }
  &-content {
    font-size: 20px;
    font-weight: bold;
    margin-right: 10px;
    max-width: 300px;
  }
  .cursor {
    cursor: pointer;
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
  font-size: 26px;
  font-weight: bold;
  text-align: center;
  padding: 12px 20px;
  color: #FFFFFF;
  border-radius: 5px;
  background: linear-gradient(90deg, #60b2fb, #6485f6);
  &-label {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: normal;
  }
}
.dropdown-title {
  padding-left: 10px;
}
:deep(.el-button--mini.is-round) {
  padding: 5px 10px;
}
:deep(.el-icon-check) {
  color: #409EFF;
  margin-left: 20px;
}
:deep(.el-dropdown-menu__item) {
  padding: 0 10px;
}
</style>
