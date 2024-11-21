<template>
  <div>
    <!--列表-->
    <div v-if="listData?.length > 0" class="list-wrap">
      <div class="list-group">
        <div
          class="item-wrap"
          v-for="(item, index) in listData"
          :key="index"
          @click.stop="onToggle(item)"
        >
          <img
            class="checked-icon"
            :src="item?.checked ? activeIcon : inactiveIcon"
            alt=""
            @click.stop="onToggle(item)"
          />
          <Avatar :name="item?.groupName" :isGroup="true" />
          <div class="name">{{ `${item?.groupName ?? ''}（${item?.groupMemberCount ?? ''}）` }}</div>
        </div>
      </div>
    </div>
    <!--无结果-->
    <Empty v-if="showEmpty" />
  </div>
</template>

<script setup>
import Empty from '@/view/address-book/components/empty/index.vue';
import activeIcon from '@/assets/images/address-book/active.svg';
import inactiveIcon from '@/assets/images/address-book/inactive.svg';
import { computed, onMounted, ref, watchEffect } from 'vue';
import requestApi from '@/view/address-book/api';
import useAddressBook from '@/store/modules/addressBook';
import Avatar from '@/view/address-book/components/avatar/index.vue';

const addressBookStore = useAddressBook();

// 列表数据
const listData = ref([]);

// 无结果
const isEmpty = ref(false);

// 是否显示无搜索结果UI
const showEmpty = computed(() => {
  return listData.value.length === 0 && isEmpty.value;
});

// 获取群组列表
const getGroupList = () => {
  requestApi.groupList().then(res => {
    const { data } = res;
    listData.value = data || [];
    isEmpty.value = listData.value.length === 0 && data?.length === 0;
  });
};

// 点击切换选中状态
const onToggle = (obj) => {
  let item = {};
  const index = listData.value.findIndex(i => i?.groupId === obj?.groupId);
  if (index > -1) {
    item = { ...listData.value[index] };
    item.checked = !item.checked;
    item.isGroup = true;
  }
  addressBookStore.pushList(item);
};

watchEffect(() => {
  const list = addressBookStore.selectedList;
  listData.value = listData.value.map(i => {
    const findItem = list.find(j => j?.groupId === i?.groupId);
    i.checked = !!findItem;
    return i;
  });
});

onMounted(() => {
  getGroupList();
});

</script>

<style lang="scss" scoped>
.list-wrap {
  width: 100%;
  box-sizing: border-box;
  padding: 0 12px;
  margin-top: 12px;
  .list-group {
    width: 100%;
    padding: 16px 12px;
    box-sizing: border-box;
    background: #FFFFFF;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
    border-radius: 6px;
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
      .name {
        margin-left: 12px;
        font-size: 16px;
        color: #333333;
      }
    }
  }
}
</style>
