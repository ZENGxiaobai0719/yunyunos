<template>
  <div style="width: 100%; display: flex; flex-direction: column;">
    <div class="title-box">
      <span>{{ title }}</span>
      <slot name="titleButton">
      </slot>
    </div>
    <div class="content-box">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
defineProps({
  title: {
    type: String,
    default: '默认标题'
  }
})
const emits = defineEmits(['onMounted'])
onMounted(() => {
  emits('onMounted')
})
</script>

<style lang="scss" scoped>
.title-box {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  border-bottom: 2px solid #2A2A3C;
  padding: 15px 20px;
  color: #00EEA6;
  font-size: 18px;
}
.title-box::before {
  content: '';
  position: absolute;
  height: 5px;
  width: 100px;
  left: 0;
  background-color: #1A2A24;
  z-index: 99;
  bottom: -1px;
}
.content-box {
  flex: 1;
}
</style>