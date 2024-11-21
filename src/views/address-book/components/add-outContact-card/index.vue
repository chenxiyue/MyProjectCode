<template>
  <!--添加外部联系人-->
  <div class="top-wrap" @click.stop="handleAdd">
    <img class="add-img" :src="addFriendIcon" alt="" />
    <div class="text">添加外部联系人</div>
    <img class="arrow-icon" :src="arrowRightIcon" alt="" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import addFriendIcon from '@/assets/images/address-book/add-friend.svg';
import arrowRightIcon from '@/assets/images/address-book/arrow-right.svg';

const router = useRouter();

// 添加外部联系人
const handleAdd = () => {
  router.push({
    path: '/address-book/out-contact/search'
  });
};

</script>

<style lang="scss" scoped>
.top-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: #FFFFFF;
  box-sizing: border-box;
  //border-radius: 6px;
  box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
  .add-img {
    width: 22px;
    height: 22px;
  }
  .text {
    margin-left: 12px;
    font-size: 16px;
    color: #333333;
  }
  .arrow-icon {
    margin-left: auto;
    width: 20px;
    height: 20px;
  }
}
</style>
