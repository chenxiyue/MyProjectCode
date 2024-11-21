<template>
  <div class="empty-wrap">
    <img class="img" :src="emptyImg" alt="" />
    <div class="text">{{ text }}</div>
  </div>
</template>

<script setup>
import emptyImg from '@/assets/images/address-book/empty.png';

const props = defineProps({
  text: {
    type: String,
    default: '暂无数据'
  }
});

</script>

<style lang="scss" scoped>
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 170px;
  .img {
    width: 184px;
    height: 160px;
  }
  .text {
    font-size: 14px;
    font-weight: 400;
    color: #999999;
    margin-top: 10px;
  }
}
</style>
