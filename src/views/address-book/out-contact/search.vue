<template>
  <div>
    <!--顶部导航-->
    <app-nav-bar title="添加外部联系人" />
    <!--搜索框-->
    <div class="search-wrap">
      <div class="search-box">
        <img class="icon" :src="searchIcon" alt="" />
        <form class="form" action="javascript:void 0">
          <input
            v-model.trim="keyword"
            ref="searchInputRef"
            class="input"
            type="search"
            placeholder="搜索手机号或工号添加"
            autocomplete="off"
            @keyup.enter="onKeyUpEnter"
          />
        </form>
        <img
          v-show="keyword.length > 0"
          class="del-icon"
          :src="delIcon"
          alt=""
          @click.stop="clearInput"
        />
      </div>
    </div>
    <div class="content-wrap">
      <!--列表-->
      <div v-if="resultList.length > 0" class="list-wrap">
        <div
          v-for="(item, index) in resultList"
          :key="index"
          class="item-wrap"
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
          <div class="right-box">
            <span v-if="item?.ifFriend === 1" class="friend-text">已是好友</span>
            <van-button v-else class="btn" @click.stop="handleAdd(item)">添加</van-button>
          </div>
        </div>
      </div>
      <!--无结果-->
      <Empty v-if="showEmpty" text="未找到相关用户" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'addressBookOutContactSearch'
};
</script>

<script setup>
import { computed, nextTick, onActivated, onMounted, ref, watch } from 'vue';
import searchIcon from '@/assets/images/news/search.png';
import delIcon from '@/assets/images/news/delete.png';
import { useRouter } from 'vue-router';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import Empty from '@/view/address-book/components/empty/index.vue';
import requestApi from '@/view/address-book/api/index';
import { debounce } from '@/utils/common';

const router = useRouter();

const searchInputRef = ref();

// 搜索关键词
const keyword = ref('');

// 搜索结果列表
const resultList = ref([]);

// 无结果
const isEmpty = ref(false);

// 是否显示无搜索结果UI
const showEmpty = computed(() => {
  return resultList.value.length === 0 && isEmpty.value;
});

// 判断是否是手机号
const isPhone = computed(() => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(keyword.value);
});

// 搜索
const handleSearch = () => {
  const params = {
    searchKey: keyword.value
  };
  requestApi.searchExternalContact(params).then(res => {
    const data = res?.data || [];
    resultList.value = data;
    isEmpty.value = resultList.value.length === 0 && data?.length === 0;
  }).catch(() => {
    isEmpty.value = true;
  });
};

// 点击键盘搜索键
const onKeyUpEnter = (e) => {
  e.preventDefault();
  if (keyword.value.trim()) {
    handleSearch();
  }
  searchInputRef.value.blur();
};

// 清空输入框
const clearInput = () => {
  keyword.value = '';
  resultList.value = [];
};

// 添加好友
const handleAdd = debounce((obj) => {
  router.push({
    path: '/address-book/out-contact/add',
    query: {
      userUid: obj?.userUid,
      addOrigin: isPhone.value ? 2 : 1 // 1-工号, 2-手机号
    }
  });
}, 500, true);

// 监听搜索框的值变化时清空结果列表
watch(() => keyword.value, () => {
  if (resultList.value.length > 0) {
    resultList.value = [];
  }
  if (isEmpty.value) {
    isEmpty.value = false;
  }
});

onMounted(() => {
  nextTick(() => {
    searchInputRef.value.focus();
  });
});

onActivated(() => {
  if (keyword.value) {
    handleSearch();
  }
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
    .form {
      flex-grow: 1;
    }
  }
}
.content-wrap {
  width: 100%;
  //padding: 0 12px;
  box-sizing: border-box;
  .list-wrap {
    width: 100%;
    box-sizing: border-box;
    margin-top: 12px;
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
        padding-right: 12px;
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
      .right-box {
        margin-left: auto;
        .btn {
          border: none;
          padding: 0;
          width: 52px;
          height: 30px;
          background: #CD4444;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 400;
          color: #FFFFFF;
        }
        .friend-text {
          font-size: 13px;
          font-weight: 400;
          color: #999999;
        }
      }
    }
  }
}
</style>
