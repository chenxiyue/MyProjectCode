<template>
  <div class="container">
    <!--顶部导航-->
    <div class="top-wrap">
      <app-nav-bar title="已选">
        <template #right>
          <div class="top-right" @click.stop="onConfirm">
            {{ list?.length > 0 ? `确定(${list.length})` : '确定' }}
          </div>
        </template>
      </app-nav-bar>
      <div class="full-wrap" />
    </div>
    <!--列表-->
    <div v-if="list?.length > 0" class="content-wrap">
      <div class="list-wrap">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="item-wrap"
        >
          <!--联系人头像-->
          <Avatar v-if="item?.isUser" :name="item?.name" />
          <!--组织头像-->
          <Avatar v-if="item?.isOrg" :name="item?.name" :isOrg="true" />
          <!--群组头像-->
          <Avatar v-if="item?.isGroup" :name="item?.groupName" :isGroup="true" />
          <!--名字-->
          <div class="name">{{ item?.name || item?.groupName }}</div>
          <img
            class="x-icon"
            :src="xIcon"
            alt=""
            @click.stop="onDelItem(item, index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import useAddressBook from '@/store/modules/addressBook';
import xIcon from '@/assets/images/address-book/x.svg';
import { useRouter } from 'vue-router';
import Avatar from '@/view/address-book/components/avatar/index.vue';

const emits = defineEmits(['closeSelected']);

const router = useRouter();

const addressBookStore = useAddressBook();

// 已选择列表
const list = ref([]);

// 关闭页面
const closeSelectedView = () => {
  emits('closeSelected');
};

// 确定
const onConfirm = () => {
  addressBookStore.setList(list.value);
  router.back();
  closeSelectedView();
};

// 删除
const onDelItem = (obj, index) => {
  list.value.splice(index, 1);
};

watchEffect(() => {
  list.value = [...addressBookStore.selectedList];
});

onMounted(() => {
  window.history.pushState(null, null, document.URL);
  window.addEventListener('popstate', closeSelectedView);
});

onUnmounted(() => {
  window.removeEventListener('popstate', closeSelectedView);
});

</script>

<style lang="scss" scoped>
.container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10012;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background: #F4F5F7;
  .top-wrap {
    :deep(.app-nav-bar-wrapper) {
      position: fixed !important;
    }
    .full-wrap {
      width: 100%;
      height: var(--van-nav-bar-height);
    }
    .top-right {
      font-size: 18px;
      color: $primary-color;
    }
  }
  .content-wrap {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 0;
    padding-bottom: 12px !important;
    padding-bottom: calc($safe-area-inset-bottom + 12px) !important;
    .list-wrap {
      width: 100%;
      background: #FFFFFF;
      box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
      //border-radius: 6px;
      padding: 16px 20px;
      box-sizing: border-box;
      .item-wrap {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        &:last-child {
          margin-bottom: 0;
        }
        .name {
          margin-left: 12px;
          font-size: 16px;
          color: #333333;
        }
        .x-icon {
          margin-left: auto;
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}
</style>
