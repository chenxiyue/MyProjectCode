<template>
  <div>
    <!--用户列表-->
    <div
      v-for="(item, index) in listData.userList"
      :key="index"
      class="item-wrap"
      @click.stop="onToggle(item)"
    >
      <img v-if="item?.ishas" class="checked-icon" :src="activeDisableIcon" alt="" />
      <img
        v-else
        class="checked-icon"
        :src="item?.checked ? activeIcon : inactiveIcon"
        alt=""
        @click.stop="onToggle(item)"
      />
      <Avatar :name="item?.name" />
      <div class="info-box">
        <div class="name-box">
          <template v-if="item?.remark">
            <span class="remark">{{ item.remark }}</span>
            <span class="name">{{ `(${item?.name ?? ''})` }}</span>
          </template>
          <span v-else class="name">{{ item?.name ?? '' }}</span>
        </div>
        <div v-if="item?.businessSubjectMdName" class="sub-text">{{ `@${item?.businessSubjectMdName}` }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, watchEffect } from 'vue';
import useAddressBook from '@/store/modules/addressBook';
import activeIcon from '@/assets/images/address-book/active.svg';
import inactiveIcon from '@/assets/images/address-book/inactive.svg';
import activeDisableIcon from '@/assets/images/address-book/active-disable.svg';
import { useRoute, useRouter } from 'vue-router';
import Avatar from '@/view/address-book/components/avatar/index.vue';

const route = useRoute();

const router = useRouter();

const routeQuery = route.query;

const addressBookStore = useAddressBook();

const props = defineProps({
  data: {
    type: Object,
    default: () => null
  }
});

const listData = reactive({
  userList: []
});

// 点击切换选中状态
const onToggle = (obj) => {
  if (obj?.ishas) return;
  let item = {};
  const index = listData.userList.findIndex(i => i?.userUid === obj?.userUid);
  if (index > -1) {
    item = { ...listData.userList[index] };
    item.checked = !item.checked;
    item.isUser = true;
  }
  addressBookStore.pushList(item);
};

watch(() => props.data, (nval) => {
  listData.userList = nval || [];
}, {
  immediate: true,
  deep: true
});

watchEffect(() => {
  const list = addressBookStore.selectedList;
  const memberList = routeQuery?.groupMemberList ? JSON.parse(routeQuery.groupMemberList) : [];
  listData.userList = listData.userList.map(i => {
    const findItem = list.find(item => item?.isUser && (item?.userUid === i?.userUid));
    i.ishas = memberList.some(j => j === i?.userUid);
    i.checked = !!findItem;
    return i;
  });
});

</script>

<style lang="scss" scoped>
.item-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
  .checked-icon {
    margin-right: 12px;
    width: 20px;
    height: 20px;
  }
  .info-box {
    margin-left: 12px;
    .name-box {
      display: flex;
      align-items: center;
      .remark {
        min-width: 20px;
        font-size: 16px;
        color: #333333;
        @include ellipsis(1);
      }
      .name {
        font-size: 16px;
        color: #333333;
        @include ellipsis(1);
      }
    }
    .sub-text {
      margin-top: 8px;
      font-size: 13px;
      font-weight: 400;
      color: #999999;
      line-height: 13px;
    }
  }
}
</style>
