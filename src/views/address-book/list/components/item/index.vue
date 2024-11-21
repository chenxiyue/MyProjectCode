<template>
  <div>
    <!--置顶负责人角色-->
    <div
      v-for="(item, index) in listData.userList.slice(0, topUserList.length)"
      :key="index"
      class="item-wrap"
      @click.stop="onClickItem(item)"
    >
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
      @click.stop="onClickItem(item, true)"
    >
      <Avatar :name="item?.name" :isOrg="true" />
      <div class="info-box">
        <div class="name-box">
          <span class="name">{{ item?.name ?? '' }}</span>
        </div>
      </div>
      <img class="arrow-icon" :src="arrowRightIcon" alt="" />
    </div>
    <!--用户列表-->
    <div
      v-for="(item, index) in listData.userList.slice(topUserList.length)"
      :key="index"
      class="item-wrap"
      @click.stop="onClickItem(item)"
    >
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
import { computed, reactive, ref, watch } from 'vue';
import arrowRightIcon from '@/assets/images/address-book/arrow-right.svg';
import history from '@/view/address-book/config/history';
import { useRoute, useRouter } from 'vue-router';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import { jsBridgeChooseContact, jsBridgeJumpPersonalPage } from '@/utils/jsbridge/bridgeRegisterHandle';
import { usePageVisibility } from '@vant/use';
import requestApi from '@/view/address-book/api/index';
import { debounce } from '@/utils/common';

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
  }
});

const route = useRoute();

const router = useRouter();

const routeQuery = route.query;

// 选择联系人名片操作时 路由参数 mode 0-创建群组，1-邀请入群，2-选择联系人卡片
const isChooseUser = computed(() => {
  return +routeQuery?.mode === 2;
});

const listData = reactive({
  orgList: [],
  userList: []
});

// 保存当前点击的联系人数据
const currentItem = ref(null);

// 筛选出主岗位
const getJobText = (obj) => {
  const list = obj?.postList || [];
  const mainPost = list.map(i => i?.assignType === 1 && i?.name).filter(i => i);
  return mainPost.join(' & ');
};

// 点击组织打开下一层级
const onClickOrg = (obj) => {
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
  router.push({
    path: '/address-book/list',
    query
  });
};

// 点击联系人
const onClickItem = debounce((obj, isOrg = false) => {
  // 处理点击组织逻辑
  if (isOrg) {
    onClickOrg(obj);
    return;
  }

  currentItem.value = obj;

  // 发送联系人名片时
  if (isChooseUser.value) {
    jsBridgeChooseContact({
      userUid: obj?.userUid,
      userName: obj?.name,
    });
    return;
  }
  // 跳转Native个人信息页
  jsBridgeJumpPersonalPage({
    userUid: obj?.userUid,
    addOrigin: props.isFromRelateOrg ? 4 : undefined,
    isInner: 1
  });
}, 500, true);

// 根据用户id查询用户信息
const getUserInfo = () => {
  return new Promise(resolve => {
    const params = {
      userUid: currentItem.value?.userUid
    };
    requestApi.userInfoById(params).then(res => {
      const data = res?.data || null;
      resolve(data);
    }).catch(() => {
      resolve(null);
    });
  });
};

// 更新单条数据
const updateItemData = async () => {
  if (currentItem.value) {
    const newInfo = await getUserInfo();
    if (newInfo) {
      const _index = listData.userList.findIndex(i => i?.userUid === currentItem.value.userUid);
      let item = { ...listData.userList[_index] };
      item = { ...item, ...newInfo };
      listData.userList.splice(_index, 1, item);
    }
  }
};

watch(() => props.data, (nval) => {
  if (nval) {
    listData.orgList = nval?.orgList || [];
    listData.userList = nval?.userList || [];
  }
}, {
  immediate: true
});

const pageVisibility = usePageVisibility();

watch(pageVisibility, (nval, oval) => {
  if (nval === 'visible' && oval === 'hidden') {
    updateItemData();
  }
});

defineExpose({
  onClickItem
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
  .arrow-icon {
    margin-left: auto;
    width: 20px;
    height: 20px;
  }
}
</style>
