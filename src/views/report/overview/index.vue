<template>
  <div class="app-container">
    <!-- tab切换 -->
    <el-tabs v-model="activeName">
      <el-tab-pane label="销售总览" name="market">
        <market />
      </el-tab-pane>
      <el-tab-pane label="采购总览" name="purchase">
        <purchase />
      </el-tab-pane>
      <el-tab-pane label="存货总览" name="stock">
        <stock />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Market from '@/views/report/overview/Market.vue'
import Purchase from '@/views/report/overview/Purchase.vue'
import Stock from '@/views/report/overview/Stock.vue'

export default {
  name: 'Overview',
  components: {
    Stock,
    Purchase,
    Market
  },
  data() {
    return {
      activeName: ''
    }
  },
  watch: {
    '$route.query': {
      handler (val) {
        this.activeName = val.type
      },
      immediate: true
    }
  }
}
</script>
