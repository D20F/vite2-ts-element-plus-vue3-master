<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ username }}</div>
  </div>
  <div>
    <!-- <el-icon>
      <Svg.Edit></Svg.Edit>
    </el-icon> -->
  </div>  
</template>

<script setup lang="ts">
import * as Svg from '@element-plus/icons'
import { computed } from 'vue'
import { useStore } from 'vuex'

let store = useStore()
const username = computed(() => {
  return store.state.user.username
})
</script>

<style lang="scss" scoped>
.dashboard {
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
