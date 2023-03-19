<template>
  <div>
    <tinymce-editor v-model="content" :height="550" @change="bindContent" />
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
import { updateOverview } from '@/api/operations/overview'
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
    cancel() {
      console.log('cancel')
    },
    bindContent(value) {
      console.log(value)
      this.contentVal = value
    },
    confirm() {
      console.log('confirm')
      updateOverview({
        id: this.$route.query.id,
        description: this.contentVal
      }).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
