<template>
  <div>
    <!--搜索框-->
    <div class="search-wrap" :class="{'bottom': (hasResult || showEmpty) && selectedList.length === 0}">
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
    <!--已选择列表-->
    <template v-if="selectedList.length > 0">
      <div class="select-wrap" :class="{'bottom': hasResult || showEmpty}">
        <div class="item-wrap">
          <div
            v-for="(item, index) in selectedList"
            :key="index"
            class="item-box"
            @click.stop="onDelItem(item)"
          >
            <!--联系人头像-->
            <Avatar v-if="item?.isUser" :name="item?.name" width="38px" height="38px" fontSize="14px" />
            <!--组织头像-->
            <Avatar v-if="item?.isOrg" :name="item?.name" :isOrg="true" width="38px" height="38px" />
            <!--群组头像-->
            <Avatar v-if="item?.isGroup" :name="item?.groupName" :isGroup="true" width="38px" height="38px" />
          </div>
        </div>
        <img class="arrow-icon" :src="arrowRightIcon" alt="" @click.stop="onOpenSelected" />
      </div>
      <!--撑起高度-->
      <div class="full-select-wrap" :class="{'bottom': hasResult || showEmpty}" />
    </template>
    <!--结果列表-->
    <div v-if="hasResult || showEmpty" class="list-wrap" :class="{'selected': selectedList.length > 0}">
      <div v-if="!showEmpty" class="group-wrap">
        <!--组织-->
        <template v-if="resultList.orgList.length > 0">
          <div
            v-for="(item, index) in resultList.orgList"
            :key="index"
            class="item-wrap"
            @click.stop="onToggle(2, item)"
          >
            <div class="left-wrap">
              <img
                class="checked-icon"
                :src="item?.checked ? activeIcon : inactiveIcon"
                alt=""
                @click.stop="onToggle(2, item)"
              />
              <Avatar :name="item?.name" :isOrg="true" />
            </div>
            <div class="info-box">
              <div class="name-box">
                <span class="name">{{ item?.name ?? '' }}</span>
              </div>
              <div v-if="item?.pathNodeList?.length > 0" class="sub-text">{{ getOrgText(item) }}</div>
            </div>
          </div>
        </template>
        <!--群组-->
        <template v-if="resultList.groupList.length > 0">
          <div
            v-for="(item, index) in resultList.groupList"
            :key="index"
            class="item-wrap"
            @click.stop="onToggle(3, item)"
          >
            <div class="left-wrap">
              <img
                class="checked-icon"
                :src="item?.checked ? activeIcon : inactiveIcon"
                alt=""
                @click.stop="onToggle(3, item)"
              />
              <Avatar :name="item?.groupName" :isGroup="true" />
            </div>
            <div class="info-box">
              <div class="name-box">
                <span class="name">{{ `${item?.groupName ?? ''}（${item?.groupMemberCount ?? ''}）` }}</span>
              </div>
            </div>
          </div>
        </template>
        <!--联系人-->
        <template v-if="resultList.userList.length > 0">
          <div
            v-for="(item, index) in resultList.userList"
            :key="index"
            class="item-wrap"
            @click.stop="onToggle(1, item)"
          >
            <div class="left-wrap">
              <!--发送名片操作时不显示-->
              <template v-if="!isChooseUser">
                <img v-if="item?.ishas" class="checked-icon" :src="activeDisableIcon" alt="" />
                <img
                  v-else
                  class="checked-icon"
                  :src="item?.checked ? activeIcon : inactiveIcon"
                  alt=""
                  @click.stop="onToggle(1, item)"
                />
              </template>
              <Avatar :name="item?.name" />
            </div>
            <div class="info-box">
              <div class="name-box">
                <template v-if="item?.remark">
                  <span class="remark">{{ item.remark }}</span>
                  <span class="name">{{ `(${item?.name ?? ''})` }}</span>
                </template>
                <span v-else class="name">{{ item?.name ?? '' }}</span>
                <!--非同主体时显示-->
                <span
                  v-if="item?.subjectName && !item?.sameSubject"
                  class="subject"
                >@{{ item.subjectName }}</span>
              </div>
              <div v-if="item?.deptNameTree" class="sub-text">{{ item.deptNameTree }}</div>
              <div v-if="item?.jobName" class="sub-text mt-4">{{ item.jobName }}</div>
            </div>
          </div>
        </template>
      </div>
      <!--无结果-->
      <Empty v-if="showEmpty" text="未找到相关用户" />
    </div>
    <!--已选列表-->
    <SelectList v-if="showSelected" @closeSelected="showSelected = false" />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from 'vue';
import searchIcon from '@/assets/images/news/search.png';
import delIcon from '@/assets/images/news/delete.png';
import { debounce } from '@/utils/common';
import requestApi from '@/view/address-book/api/index';
import { useRoute } from 'vue-router';
import Empty from '@/view/address-book/components/empty/index.vue';
import activeIcon from '@/assets/images/address-book/active.svg';
import inactiveIcon from '@/assets/images/address-book/inactive.svg';
import activeDisableIcon from '@/assets/images/address-book/active-disable.svg';
import arrowRightIcon from '@/assets/images/address-book/arrow-right.svg';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import useAddressBook from '@/store/modules/addressBook';
import SelectList from './selected-list.vue';
import { jsBridgeChooseContact } from '@/utils/jsbridge/bridgeRegisterHandle';
import { Toast } from 'vant';

const props = defineProps({
  // 创建群操作
  isCreateGroup: {
    type: Boolean,
    default: false
  },
  // 邀请入群操作
  isInviteToGroup: {
    type: Boolean,
    default: false
  },
  // 选择联系人操作
  isChooseUser: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  }
});

const addressBookStore = useAddressBook();

const route = useRoute();

const routeQuery = route.query;

// 搜索关键词
const keyword = ref('');

// 搜索结果列表
const resultList = reactive({
  userList: [],
  orgList: [],
  groupList: []
});

// 无结果
const isEmpty = ref(false);

// 判断列表不为空
const hasResult = computed(() => {
  return resultList.userList.length > 0 ||
    resultList.orgList.length > 0 ||
    resultList.groupList.length > 0;
});

// 是否显示无搜索结果UI
const showEmpty = computed(() => {
  return resultList.userList.length === 0 &&
    resultList.orgList.length === 0 &&
    resultList.groupList.length === 0 &&
    isEmpty.value;
});

// 显示已选列表
const showSelected = ref(false);

// 已选列表
const selectedList = computed(() => {
  return addressBookStore.selectedList;
});

// 点击删除已选择的
const onDelItem = (obj) => {
  addressBookStore.popList(obj);
};

// 打开已选择列表
const onOpenSelected = () => {
  showSelected.value = true;
};

// 拉取组织内联系人数据
const fetchInnerData = () => {
  return new Promise(resolve => {
    const params = {
      isQueryAll: true,
      searchKey: keyword.value
    };
    requestApi.searchAll(params).then(res => {
      const data = res?.data || [];
      resolve(data);
    }).catch(() => {
      resolve([]);
    });
  });
};

// 拉取内部组织数据
const fetchInnerOrgData = () => {
  return new Promise(resolve => {
    const params = {
      groupSearch: true,
      searchMsg: keyword.value
    };
    requestApi.innerOrgList(params).then(res => {
      const { data } = res;
      const treeList = data?.insideOrganizationBO?.businessTreeList || [];
      resolve(treeList);
    }).catch(() => {
      resolve([]);
    });
  });
};

// 拉取群组数据
const fetchGroupData = () => {
  return new Promise(resolve => {
    const params = {
      groupSearchKey: keyword.value
    };
    requestApi.groupList(params).then(res => {
      const data = res?.data || [];
      resolve(data);
    }).catch(() => {
      resolve([]);
    });
  });
};

// 拉取关联组织数据
const fetchRelateOrgData = () => {
  return new Promise(resolve => {
    const params = {
      businessTreeMdCode: +addressBookStore.subRouteQuery?.mdCode,
      rootMdCode: +addressBookStore.subRouteQuery?.rootMdCode,
      searchMsg: keyword.value
    };
    requestApi.relateOrgList(params).then(res => {
      const empList = res?.data?.empInfoList || [];
      const businessList = res?.data?.businessTreeList?.map(i => {
        i.relateOrgFlag = true;
        return i;
      }) || [];
      resolve({ empList, businessList });
    }).catch(() => {
      resolve([]);
    });
  });
};

// 发送名片时搜索
const searchForChooseUser = async () => {
  const innerRes = await fetchInnerData();
  const relateRes = await fetchRelateOrgData();

  const [innerList, relateData] = await Promise.all([innerRes, relateRes]);

  const empList = relateData?.empList || [];

  resultList.userList = [...innerList, ...empList];

  isEmpty.value = innerList?.length === 0 && empList?.length === 0;
};

// 执行搜索
const handleSearch = async () => {
  Toast.loading({
    duration: 0,
    forbidClick: true
  });

  try {
    // 发送名片操作时
    if (props.isChooseUser) {
      await searchForChooseUser();
      Toast.clear();
      return;
    }

    const innerRes = await fetchInnerData();
    const innerOrgRes = await fetchInnerOrgData();
    const relateRes = await fetchRelateOrgData();
    const groupRes = await fetchGroupData();

    const [innerList, innerOrgList, groupList, relateData] = await Promise.all([innerRes, innerOrgRes, groupRes, relateRes]);

    const empList = relateData?.empList || [];
    const relateBusinessList = relateData?.businessList || [];

    resultList.userList = [...innerList, ...empList];
    resultList.groupList = groupList || [];
    resultList.orgList = [...innerOrgList, ...relateBusinessList];

    Toast.clear();

    isEmpty.value = innerList?.length === 0 &&
      groupList?.length === 0 &&
      empList?.length === 0 &&
      innerOrgList?.length === 0 &&
      relateBusinessList?.length === 0;
  } catch (e) {
    Toast.clear();
  }
};

// 处理部门文案
const getOrgText = (obj) => {
  const list = obj?.pathNodeList || [];
  const deptList = list.map(i => i?.name);
  return deptList.join('-');
};

// 清空输入框
const clearInput = () => {
  keyword.value = '';
  resultList.userList = [];
  resultList.orgList = [];
  resultList.groupList = [];
  isEmpty.value = false;
};

// 输入事件回调
const onInput = debounce(() => {
  if (keyword.value === '') {
    clearInput();
    return;
  }
  if (keyword.value) {
    handleSearch();
  }
}, 500);

const onToggle = (type, obj) => {
  // 发送联系人卡片时
  if (props.isChooseUser) {
    jsBridgeChooseContact({
      userUid: obj?.userUid,
      userName: obj?.name
    });
    return;
  }
  // 判断是否已有或自己
  if (obj?.ishas) return;

  let item = {};
  // 联系人
  if (type === 1) {
    const index = resultList.userList.findIndex(i => i?.userUid === obj?.userUid);
    if (index > -1) {
      item = { ...resultList.userList[index] };
      item.checked = !item.checked;
      item.isUser = true;
    }
  }
  // 组织
  if (type === 2) {
    const index = resultList.orgList.findIndex(i => i?.mdCode === obj?.mdCode);
    if (index > -1) {
      item = { ...resultList.orgList[index] };
      item.checked = !item.checked;
      item.isOrg = true;
    }
  }
  // 群组
  if (type === 3) {
    const index = resultList.groupList.findIndex(i => i?.groupId === obj?.groupId);
    if (index > -1) {
      item = { ...resultList.groupList[index] };
      item.checked = !item.checked;
      item.isGroup = true;
    }
  }
  addressBookStore.pushList(item);
};

watchEffect(() => {
  if (props.isChooseUser) return;
  const selectList = addressBookStore.selectedList;
  const memberList = routeQuery?.groupMemberList ? JSON.parse(routeQuery.groupMemberList) : [];
  resultList.userList = resultList.userList.map(i => {
    const findItem = selectList.find(j => j?.userUid === i?.userUid);
    i.ishas = i?.userUid === +routeQuery?.userUid || memberList.some(j => j === i?.userUid);
    i.checked = !!findItem;
    return i;
  });
  resultList.orgList = resultList.orgList.map(i => {
    const findItem = selectList.find(j => j?.mdCode === i?.mdCode);
    i.checked = !!findItem;
    return i;
  });
  resultList.groupList = resultList.groupList.map(i => {
    const findItem = selectList.find(j => j?.groupId === i?.groupId);
    i.checked = !!findItem;
    return i;
  });
});

</script>

<style lang="scss" scoped>
//搜索框容器高度
$searchWrapHeight: 44px;
// 已选择列表容器高度
$selectedWrapHeight: 62px;

.search-wrap {
  position: fixed;
  z-index: 10001;
  width: 100%;
  height: $searchWrapHeight;
  padding: 7px 20px;
  box-sizing: border-box;
  background: #FFFFFF;
  &.bottom {
    border-bottom: 0.5px solid #E3E3E3;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
  }
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
.full-wrap {
  width: 100%;
  height: $searchWrapHeight;
}
.select-wrap {
  position: fixed;
  z-index: 10001;
  width: 100%;
  height: $selectedWrapHeight;
  padding: 12px 24px 12px 20px;
  box-sizing: border-box;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  &.bottom {
    border-bottom: 0.5px solid #E3E3E3;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
  }
  .item-wrap {
    display: flex;
    overflow-x: auto;
    .item-box {
      margin-right: 24px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  .arrow-icon {
    margin-left: auto;
    width: 20px;
    height: 20px;
    padding-left: 20px;
  }
}
.full-select-wrap {
  width: 100%;
  height: $selectedWrapHeight;
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
  padding-bottom: 56px !important;
  padding-bottom: calc($safe-area-inset-bottom + 56px) !important;
  &.selected {
    padding-bottom: calc($selectedWrapHeight + 56px) !important;
    padding-bottom: calc($safe-area-inset-bottom + $selectedWrapHeight + 56px) !important;
  }
  .group-wrap {
    width: 100%;
    padding: 16px 20px;
    background: #FFFFFF;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
    //border-radius: 6px;
    box-sizing: border-box;
    .item-wrap {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
      .left-wrap {
        display: flex;
        align-items: center;
        .checked-icon {
          margin-right: 12px;
          width: 20px;
          height: 20px;
        }
      }
      .info-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 46px;
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
          .subject {
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            margin-left: 4px;
            @include ellipsis(1);
          }
        }
        .sub-text {
          margin-top: 6px;
          font-size: 11px;
          font-weight: 400;
          color: #999999;
          line-height: 15px;
          &.mt-4 {
            margin-top: 4px;
          }
        }
      }
    }
  }
}
</style>
