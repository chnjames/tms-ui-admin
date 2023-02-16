<template>
  <div class="app-container">
    <el-drawer v-bind="$attrs" v-on="$listeners" :before-close="handleClose">
      <el-scrollbar class="scrollbar">
        <div class="content">
          <slot/>
        </div>
        <div class="seat"></div>
        <div class="footer">
          <slot name="footer"/>
        </div>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'DrawerPlus',
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    }
  }
}
</script>

<style lang="scss" scoped>
$height: 60px;
.content {
  padding: 20px;
  height: calc(100% - #{$height});
}
.scrollbar {
  height: 100%;
  position: relative;
  :deep(.el-scrollbar__view) {
    height: calc(100% - #{$height});
  }

  .seat {
    height: $height;
  }

  .footer {
    padding: 0 20px;
    z-index: 9;
    box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.08);
    width: 100%;
    position: absolute;
    bottom: 0;
    height: $height;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
