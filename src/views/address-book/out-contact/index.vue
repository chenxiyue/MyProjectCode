<template>
  <div>
    <template v-if="!hide">
      <!--顶部导航-->
      <app-nav-bar title="外部联系人" />
      <!--搜索-->
      <div class="search-wrap">
        <div class="search-box">
          <img class="icon" :src="searchIcon" alt="" />
          <input
            v-model.trim="keyword"
            class="input"
            placeholder="搜索外部联系人"
            autocomplete="off"
            @input="onInput"
          />
          <img
            v-show="keyword.length > 0"
            class="del-icon"
            :src="delIcon"
            alt=""
            @click.stop="clearInput"
          />
        </div>
      </div>
    </template>
    <div class="content-wrap">
      <!--添加外部联系人卡片-->
      <AddExContactCard v-if="!hide" />
      <!--列表-->
      <div v-if="userList.length > 0" class="list-wrap">
        <CheckboxItem v-if="isCreateGroup || isInviteToGroup" :data="userList" />
        <template v-if="!isCreateGroup && !isInviteToGroup">
          <div
            v-for="(item, index) in userList"
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
              <div class="sub-text">{{ `@${item?.businessSubjectMdName ?? ''}` }}</div>
            </div>
          </div>
        </template>
      </div>
      <!--无结果-->
      <Empty v-if="showEmpty" text="暂无外部联系人" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'addressBookOutContact'
};
</script>

<script setup>
import { computed, watch, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AddExContactCard from '@/view/address-book/components/add-outContact-card/index.vue';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import requestApi from '@/view/address-book/api/index';
import Empty from '@/view/address-book/components/empty/index.vue';
import { jsBridgeChooseContact, jsBridgeJumpPersonalPage } from '@/utils/jsbridge/bridgeRegisterHandle';
import CheckboxItem from './components/checkbox-item/index.vue';
import { usePageVisibility } from '@vant/use';
import searchIcon from '@/assets/images/news/search.png';
import delIcon from '@/assets/images/news/delete.png';
import { debounce } from '@/utils/common';

const route = useRoute();

const router = useRouter();

const routeQuery = route.query;

// 搜索关键词
const keyword = ref('');

// 创建群组操作时 路由参数 mode 0-创建群组，1-邀请入群，2-选择联系人卡片
const isCreateGroup = computed(() => {
  return +routeQuery?.mode === 0;
});

// 邀请入群操作时 路由参数 mode 0-创建群组，1-邀请入群，2-选择联系人卡片
const isInviteToGroup = computed(() => {
  return +routeQuery?.mode === 1;
});

// 选择联系人名片操作时 路由参数 mode 0-创建群组，1-邀请入群，2-选择联系人卡片
const isChooseUser = computed(() => {
  return +routeQuery?.mode === 2;
});

// 创建群组/选择联系人名片时隐藏
const hide = computed(() => {
  return isCreateGroup.value || isInviteToGroup.value || isChooseUser.value;
});

// 联系人列表
const userList = ref([]);

const isEmpty = ref(false);

// 列表为空
const showEmpty = computed(() => {
  return userList.value?.length === 0 && isEmpty.value;
});

// 获取联系人列表
const getUserList = () => {
  const params = {
    searchMsg: keyword.value || undefined
  };
  requestApi.externalContactList(params).then(res => {
    const data = res?.data || [];
    userList.value = data;
    isEmpty.value = userList.value.length === 0 && data?.length === 0;
  }).catch(() => {
    isEmpty.value = true;
  });
};

// 清空输入框
const clearInput = () => {
  keyword.value = '';
  getUserList();
  isEmpty.value = false;
};

// 输入事件回调
const onInput = debounce(() => {
  if (keyword.value === '') {
    clearInput();
    return;
  }
  if (keyword.value.trim()) {
    getUserList();
  }
}, 500);

// 点击跳转联系人信息界面
const onClickItem = debounce((obj) => {
  // 发送联系人名片时
  if (isChooseUser.value) {
    jsBridgeChooseContact({
      userUid: obj?.userUid,
      userName: obj?.name
    });
    return;
  }
  // 跳转Native个人信息页
  jsBridgeJumpPersonalPage({
    userUid: obj?.userUid
  });
}, 500, true);

const pageVisibility = usePageVisibility();

watch(pageVisibility, (nval, oval) => {
  if (nval === 'visible' && oval === 'hidden') {
    getUserList();
  }
});

onMounted(() => {
  getUserList();
});

</script>

<style lang="scss" scoped>
.search-wrap {
  width: 100%;
  height: 44px;
  padding: 7px 20px;
  box-sizing: border-box;
  background: #FFFFFF;
  box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
  .search-box {
    width: 100%;
    height: 30px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    flex-grow: 1;
    background: #F4F5F7;
    box-sizing: border-box;
    border-radius: 15px;
    .icon {
      width: 16px;
      height: 16px;
    }
    .input {
      border: none;
      width: 100%;
      flex-grow: 1;
      background: transparent;
      padding: 0 9px;
      font-size: 15px;
      font-weight: 500;
      color: #2E2E2E;
      line-height: var(--van-cell-line-height);
      &::-webkit-input-placeholder {
        font-weight: normal;
        color: #999999;
      }
    }
    .del-icon {
      width: 18px;
      height: 18px;
    }
  }
}
.content-wrap {
  box-sizing: border-box;
  padding: 12px 0;
  padding-bottom: 12px !important;
  padding-bottom: calc($safe-area-inset-bottom + 12px) !important;
  .list-wrap {
    margin-top: 12px;
    width: 100%;
    box-sizing: border-box;
    padding: 16px 20px;
    background: #FFFFFF;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
    //border-radius: 6px;
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
  }
}
</style>
