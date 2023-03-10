<template>
  <div>
    <tinymce-editor v-model="content" :height="550" />
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
  methods: {
    cancel() {
      console.log('cancel')
    },
    confirm() {
      console.log('confirm')
    }
  }
}
</script>

<style scoped>

</style>
