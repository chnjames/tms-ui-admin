<template>
  <div>
    <tinymce-editor v-model="contentVal" :height="550" @change="bindContent" />
    <div style="margin-top:15px;float:right;" >
      <!--取消-->
      <el-button @click="cancel">取消</el-button>
      <!--确认-->
      <el-button size="medium" type="primary" @click="confirm">确认</el-button>
    </div>
  </div>
</template>

<script>
import TinymceEditor from '@/components/TinymceEditor/index.vue'
import { getOverview, updateOverview } from '@/api/operations/overview'
export default {
  name: 'ComTinymceEditor',
  components: {
    TinymceEditor
  },
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      contentVal: this.content
    }
  },
  methods: {
    /** 获取项目详情 */
    getOverview() {
      getOverview(this.$route.query.id).then(response => {
        const { data } = response
        this.contentVal = data.description
      })
    },
    cancel() {
      this.getOverview()
    },
    bindContent(value) {
      this.contentVal = value
    },
    confirm() {
      updateOverview({
        id: this.$route.query.id,
        description: this.contentVal
      }).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
        this.getOverview()
      })
    }
  }
}
</script>

<style scoped>

</style>
