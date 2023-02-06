<template>
  <div>
    <svg-icon icon-class="question" @click="goto"/>
  </div>
</template>

<script>
export default {
  name: 'TmsDoc',
  data() {
    return {
      url: 'http://www.iocoder.cn/Tms/build-debugger-environment/?tms'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
