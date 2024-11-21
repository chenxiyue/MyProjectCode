<template>
  <div>
    <!--置顶负责人角色-->
    <div
      v-for="(item, index) in listData.userList.slice(0, topUserList.length)"
      :key="index"
      class="item-wrap"
      @click.stop="onToggle(1, item)"
    >
      <img v-if="item?.ishas" class="checked-icon" :src="activeDisableIcon" alt="" />
      <img
        v-else
        class="checked-icon"
        :src="item?.checked ? activeIcon : inactiveIcon"
        alt=""
        @click.stop="onToggle(1, item)"
      />
      <Avatar :name="item?.name" />
      <div class="info-box">
        <div class="name-box">
          <template v-if="item?.remark">
            <span class="remark">{{ item.remark }}</span>
            <span class="name">{{ `(${item?.name ?? ''})` }}</span>
          </template>
          <span v-else class="name">{{ item?.name ?? '' }}</span>
          <div class="tag-wrap">
            <span
              v-for="(pItem, pIndex) in item?.tagList"
              :key="pIndex"
              :class="['tag', pIndex === 0 ? 'main-tag' : 'other-tag']"
            >{{ pItem?.tagName }}</span>
          </div>
        </div>
        <div v-if="getJobText(item)" class="sub-text">{{ getJobText(item) }}</div>
      </div>
    </div>
    <!--组织列表-->
    <div
      v-for="(item, index) in listData.orgList"
      :key="index"
      class="item-wrap"
      @click.stop="onToggle(2, item)"
    >
      <img v-if="isJoint" class="checked-icon" :src="activeDisableIcon" alt="" />
      <img
        v-else
        class="checked-icon"
        :src="item?.checked ? activeIcon : inactiveIcon"
        alt=""
        @click.stop="onToggle(2, item)"
      />
      <Avatar :name="item?.name" :isOrg="true" />
      <div class="info-box">
        <div class="name-box">
          <span class="name">{{ item?.name ?? '' }}</span>
        </div>
      </div>
      <div
        class="next-btn"
        :class="{'disable': item?.checked}"
        @click.stop="onClickOrg(item)"
      >下级</div>
    </div>
    <!--用户列表-->
    <div
      v-for="(item, index) in listData.userList.slice(topUserList.length)"
      :key="index"
      class="item-wrap"
      @click.stop="onToggle(1, item)"
    >
      <img v-if="item?.ishas" class="checked-icon" :src="activeDisableIcon" alt="" />
      <img
        v-else
        class="checked-icon"
        :src="item?.checked ? activeIcon : inactiveIcon"
        alt=""
        @click.stop="onToggle(1, item)"
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
        <div v-if="getJobText(item)" class="sub-text">{{ getJobText(item) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, watchEffect } from 'vue';
import activeIcon from '@/assets/images/address-book/active.svg';
import inactiveIcon from '@/assets/images/address-book/inactive.svg';
import activeDisableIcon from '@/assets/images/address-book/active-disable.svg';
import history from '@/view/address-book/config/history';
import { useRoute, useRouter } from 'vue-router';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import useAddressBook from '@/store/modules/addressBook';
import { debounce } from '@/utils/common';

const route = useRoute();

const router = useRouter();

const routeQuery = route.query;

const addressBookStore = useAddressBook();

const props = defineProps({
  data: {
    type: Object,
    default: () => null
  },
  isRoot: {
    type: Boolean,
    default: false
  },
  // 是否从关联组织入口进入
  isFromRelateOrg: {
    type: Boolean,
    default: false
  },
  // 置顶联系人
  topUserList: {
    type: Array,
    default: () => []
  },
  // 是否是联营商
  isJoint: {
    type: Boolean,
    default: false
  }
});

const listData = reactive({
  orgList: [],
  userList: []
});

// 筛选出主岗位
const getJobText = (obj) => {
  const list = obj?.postList || [];
  const mainPost = list.map(i => i?.assignType === 1 && i?.name).filter(i => i);
  return mainPost.join(' & ');
};

// 点击切换选中状态
const onToggle = (type, obj) => {
  if (type === 2 && props.isJoint) return;
  if (obj?.ishas) return;
  let item = {};
  // 联系人
  if (type === 1) {
    const index = listData.userList.findIndex(i => i?.userUid === obj?.userUid);
    if (index > -1) {
      item = { ...listData.userList[index] };
      item.checked = !item.checked;
      item.isUser = true;
    }
  }
  // 组织
  if (type === 2) {
    const index = listData.orgList.findIndex(i => i?.mdCode === obj?.mdCode);
    if (index > -1) {
      item = { ...listData.orgList[index] };
      item.checked = !item.checked;
      item.isOrg = true;
    }
  }
  if (props.isFromRelateOrg) {
    item.relateOrgFlag = true;
  }
  addressBookStore.pushList(item);
};

// 跳转
const onClickOrg = debounce((obj) => {
  if (obj?.checked) return;
  history.delta++;
  const query = {
    ...routeQuery,
    mdCode: obj?.mdCode
  };
  // 跳转时去掉 isRoot 根节点标识
  if (props.isRoot) {
    query.rootMdCode = obj?.mdCode;
    query.isRoot = undefined;
  }
  addressBookStore.setSubRouteQuery(query);
  router.push({
    path: '/address-book/list',
    query
  });
}, 500, true);

watch(() => props.data, (nval) => {
  if (nval) {
    listData.orgList = nval?.orgList || [];
    listData.userList = nval?.userList || [];
  }
}, {
  immediate: true
});

watchEffect(() => {
  const list = addressBookStore.selectedList;
  listData.orgList = listData.orgList.map(i => {
    const findItem = list.find(item => item?.isOrg && (item?.mdCode === i?.mdCode));
    i.checked = !!findItem;
    return i;
  });
  const memberList = routeQuery?.groupMemberList ? JSON.parse(routeQuery.groupMemberList) : [];
  listData.userList = listData.userList.map(i => {
    const findItem = list.find(item => item?.isUser && (item?.userUid === i?.userUid));
    i.ishas = i?.userUid === +routeQuery?.userUid || memberList.some(j => j === i?.userUid);
    i.checked = !!findItem;
    return i;
  });
});

defineExpose({
  onClickOrg
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
      .tag-wrap {
        min-width: 100px;
        display: flex;
        overflow-x: auto;
        .tag {
          flex-shrink: 0;
          padding: 3px 4px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 3px;
          margin-left: 6px;
          line-height: 12px;
          &.main-tag {
            color: #CD4444;
            background: rgba(205, 68, 68, 0.2);
          }
          &.other-tag {
            color: #6E64FA;
            background: rgba(110, 100, 250, 0.2);
          }
        }
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
  .next-btn {
    margin-left: auto;
    font-size: 13px;
    font-weight: 400;
    color: $primary-color;
    &.disable {
      font-weight: 400;
      color: #999999;
    }
  }
}
</style>
