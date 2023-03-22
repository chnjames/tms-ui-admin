<template>
  <div>
    <tinymce-editor v-model="contentVal" :height="550" @change="bindContent" />
    <div style="margin-top:15px;float:right;" >
      <!--取消-->
      <el-button @click="cancel" :disabled="!isUpdate">取消</el-button>
      <!--确认-->
      <el-button size="medium" type="primary" :disabled="!isUpdate" @click="confirm">确认</el-button>
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
  computed: {
    isUpdate() {
      return this.contentVal !== this.content
    }
  },
  data() {
    return {
      contentVal: this.content
    }
  },
  methods: {
    cancel() {
      this.contentVal = this.content
    },
    bindContent(value) {
      this.contentVal = value
    },
    confirm() {
      this.$emit('content-change', this.contentVal)
    }
  }
}
</script>

<style scoped>

</style>
