<template>
  <div>
    <!--搜索框-->
    <div class="search-wrap">
      <div class="search-box">
        <img class="icon" :src="searchIcon" alt="" />
        <input
          v-model.trim="keyword"
          class="input"
          :placeholder="placeholder"
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
    <!--撑起高度-->
    <div class="full-wrap" />
    <!--结果列表-->
    <div v-if="hasResult || showEmpty" class="list-wrap">
      <div v-if="!showEmpty" class="group-wrap">
        <!--组织-->
        <template v-if="resultList.orgList.length > 0">
          <div
            v-for="(item, index) in resultList.orgList"
            :key="index"
            class="item-wrap"
            @click.stop="onClickItem(item, true)"
          >
            <Avatar :name="item?.name" :isOrg="true" />
            <div class="name-box">
              <div class="name">{{ item?.name ?? '' }}</div>
            </div>
            <img class="arrow-icon" :src="arrowRightIcon" alt="" />
          </div>
        </template>
        <!--联系人-->
        <template v-if="resultList.userList.length > 0">
          <div
            v-for="(item, index) in resultList.userList"
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
              <div v-if="item?.postList?.length > 0" class="sub-text">{{ getJobText(item) }}</div>
            </div>
            <img
              class="right-box"
              :src="detailCardIcon"
              alt=""
              @click.stop="checkDetail(item)"
            />
          </div>
        </template>
      </div>
      <!--无结果-->
      <Empty v-if="showEmpty" text="未找到相关用户" />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import searchIcon from '@/assets/images/news/search.png';
import delIcon from '@/assets/images/news/delete.png';
import detailCardIcon from '@/assets/images/address-book/detail-card.svg';
import arrowRightIcon from '@/assets/images/address-book/arrow-right.svg';
import { debounce } from '@/utils/common';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import requestApi from '@/view/address-book/api/index';
import { useRoute, useRouter } from 'vue-router';
import Empty from '@/view/address-book/components/empty/index.vue';
import { jsBridgeJumpPersonalPage, jsBridgeNavigateToFriendChat } from '@/utils/jsbridge/bridgeRegisterHandle';
import { Toast } from 'vant';

const emits = defineEmits(['listDone', 'clearInput', 'jumpOrg']);

const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  // 是否从关联组织入口进入
  isFromRelateOrg: {
    type: Boolean,
    default: false
  }
});

const route = useRoute();

const router = useRouter();

const routeQuery = route.query;

// 搜索关键词
const keyword = ref('');

// 搜索结果列表
const resultList = reactive({
  userList: [],
  orgList: []
});

// 无结果
const isEmpty = ref(false);

// 判断列表不为空
const hasResult = computed(() => {
  return resultList.userList.length > 0 ||
    resultList.orgList.length > 0;
});

// 是否显示无搜索结果UI
const showEmpty = computed(() => {
  return (resultList.userList.length === 0 && resultList.orgList.length === 0) && isEmpty.value;
});

// 加载内部组织数据
const fetchInnerOrgList = () => {
  const params = {
    isQueryAll: false,
    searchMsg: keyword.value
  };
  requestApi.orgUserSearch(params).then(res => {
    const empList = res?.data?.insideOrganizationBO?.empInfoList || [];
    resultList.userList = empList;
    isEmpty.value = resultList.userList.length === 0 && empList.length === 0;
    Toast.clear();
  }).catch(() => {
    isEmpty.value = true;
    Toast.clear();
  });
};

// 加载关联组织数据
const fetchRelateList = () => {
  const params = {
    businessTreeMdCode: routeQuery?.mdCode ? +routeQuery?.mdCode : undefined,
    rootMdCode: routeQuery?.rootMdCode ? +routeQuery?.rootMdCode : undefined,
    searchMsg: keyword.value
  };
  requestApi.relateOrgList(params).then(res => {
    const { businessTreeList, empInfoList } = res?.data || {};
    resultList.orgList = businessTreeList || [];
    resultList.userList = empInfoList || [];
    isEmpty.value = resultList.userList.length === 0 &&
      resultList.orgList.length === 0 &&
      (!businessTreeList || businessTreeList?.length === 0) &&
      (!empInfoList || empInfoList?.length === 0);
    Toast.clear();
  }).catch(() => {
    isEmpty.value = true;
    Toast.clear();
  });
};

// 执行搜索
const handleSearch = () => {
  Toast.loading({
    duration: 0,
    forbidClick: true
  });
  if (props.isFromRelateOrg) {
    fetchRelateList();
  } else {
    fetchInnerOrgList();
  }
};

// 筛选出主岗位
const getJobText = (obj) => {
  const list = obj?.postList || [];
  const mainPost = list.map(i => i?.assignType === 1 && i?.name);
  return mainPost.join(' & ');
};

// 清空输入框
const clearInput = () => {
  keyword.value = '';
  resultList.userList = [];
  resultList.orgList = [];
  isEmpty.value = false;
};

// 输入事件回调
const onInput = debounce(() => {
  if (keyword.value === '') {
    clearInput();
    return;
  }
  if (keyword.value.trim()) {
    handleSearch();
  }
}, 500);

// 点击
const onClickItem = debounce((obj, isOrg = false) => {
  // 点击组织
  if (isOrg) {
    emits('jumpOrg', obj);
    return;
  }
  // 点击联系人打开聊天框
  jsBridgeNavigateToFriendChat({
    userUid: obj?.userUid,
    isInner: !props.isFromRelateOrg ? 1 : undefined
  });
}, 500, true);

// 查看详情
const checkDetail = debounce((obj) => {
  // 跳转Native个人信息页
  jsBridgeJumpPersonalPage({
    userUid: obj?.userUid
  });
}, 500, true);

</script>

<style lang="scss" scoped>
// 搜索框容器高度
$searchWrapHeight: 44px;

.search-wrap {
  position: fixed;
  width: 100%;
  height: $searchWrapHeight;
  padding: 7px 20px;
  box-sizing: border-box;
  background: #FFFFFF;
  margin-top: -2px;
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
      padding: 0 6px;
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
.full-wrap {
  width: 100%;
  height: $searchWrapHeight;
}
.list-wrap {
  position: fixed;
  z-index: 10000;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 12px 0;
  background: #f4f5f7;
  padding-bottom: calc($searchWrapHeight + var(--van-nav-bar-height) + 12px) !important;
  padding-bottom: calc($safe-area-inset-bottom + $searchWrapHeight + var(--van-nav-bar-height) + 12px) !important;
  .group-wrap {
    width: 100%;
    padding: 16px 20px;
    background: #FFFFFF;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
    //border-radius: 6px;
    box-sizing: border-box;
    .item-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
      .info-box {
        margin-left: 12px;
        padding-right: 12px;
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
      .right-box {
        margin-left: auto;
        width: 20px;
        height: 16px;
      }
      .arrow-icon {
        margin-left: auto;
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
