<template>
  <div>
    <!--创建群组/发送联系人名片时不显示-->
    <template v-if="!isCreateGroup && !isChooseUser && !isInviteToGroup">
      <!--顶部导航-->
      <div class="top-wrap">
        <app-nav-bar :title="pageTitle" />
        <div class="full-wrap" />
      </div>
      <!--搜索框 联营商不显示-->
      <Search
        v-if="!isJoint"
        :isFromRelateOrg="isRelateOrg"
        :placeholder="searchPlaceholder"
        @jumpOrg="onSearchJumpOrg"
      />
    </template>
    <!--组织面包屑-->
    <OrgBreadcrumb :list="breadList" />
    <!--用户列表-->
    <div v-if="listData.orgList.length > 0 || listData.userList.length > 0" class="list-wrap">
      <div class="group-wrap">
        <Item
          ref="itemRef"
          v-if="!isCreateGroup && !isInviteToGroup"
          :data="listData"
          :isFromRelateOrg="isRelateOrg"
          :isRoot="isRoot"
          :topUserList="topUserList"
        />
        <CheckboxItem
          ref="checkItemRef"
          v-if="isCreateGroup || isInviteToGroup"
          :data="listData"
          :isFromRelateOrg="isRelateOrg"
          :isRoot="isRoot"
          :isJoint="isJoint"
          :topUserList="topUserList"
        />
      </div>
    </div>
    <!--无结果-->
    <Empty v-if="showEmpty" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import history from '../config/history';
import Item from './components/item/index.vue';
import CheckboxItem from './components/checkbox-item/index.vue';
import requestApi from '@/view/address-book/api/index';
import Empty from '@/view/address-book/components/empty/index.vue';
import Search from './components/search/index.vue';
import OrgBreadcrumb from '@/view/address-book/components/org-breadcrumb/index.vue';
import { Toast } from 'vant';

const emits = defineEmits(['checked']);

const route = useRoute();

const router = useRouter();

// 路由参数
const routeQuery = route.query;

const itemRef = ref();

const checkItemRef = ref();

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

// 从关联组织入口进入时
const isRelateOrg = computed(() => {
  return +routeQuery?.relateOrg === 1;
});

// 是否是关联组织的根节点
const isRoot = computed(() => {
  return +routeQuery?.isRoot === 1;
});

// 是否是联营商
const isJoint = computed(() => {
  return +routeQuery?.isJoint === 1;
});

// 组织面包屑列表
const breadList = ref([]);

// 列表数据
const listData = reactive({
  orgList: [],
  userList: []
});

// 岗位配置列表
const jobConfigList = ref(null);

// 列表为空
const isEmpty = ref(false);

const showEmpty = computed(() => {
  return listData.orgList?.length === 0 && listData.userList?.length === 0 && isEmpty.value;
});

// 导航栏标题
const pageTitle = computed(() => {
  if (isRelateOrg.value && isRoot.value) {
    return '关联组织';
  }
  if (breadList.value?.length > 0) {
    return breadList.value[breadList.value.length - 1]?.name;
  }
  return '';
});

// 搜索框占位符
const searchPlaceholder = computed(() => {
  return isRelateOrg.value && isRoot.value ? '搜索合作伙伴主体' : '搜索联系人';
});

// 获取岗位配置
const getJobConfig = () => {
  requestApi.jobConfigData().then(res => {
    jobConfigList.value = res?.data || null;
  });
};

// 筛选出置顶岗位人员列表
const topUserList = ref([]);

// 处理联系人列表
const handleUserList = (list) => {
  const normalUserList = [];
  list.forEach(i => {
    i.tagList = i?.postList?.filter(j => {
      const hasItem = jobConfigList.value?.find(f => f?.jobCode === j?.postMdCode);
      if (hasItem) {
        j.tagName = hasItem?.jobName || '';
      }
      return !!hasItem;
    });
    if (i.tagList?.length > 0) {
      i.tagList = i.tagList.sort((a, b) => {
        const aIndex = jobConfigList.value?.findIndex(f => f?.jobCode === a?.postMdCode);
        const bIndex = jobConfigList.value?.findIndex(f => f?.jobCode === b?.postMdCode);
        return aIndex - bIndex;
      });
      topUserList.value.push(i);
    } else {
      normalUserList.push(i);
    }
  });
  return [...topUserList.value, ...normalUserList];
};

// 获取列表数据
const getListData = () => {
  const params = {
    businessTreeMdCode: routeQuery?.mdCode ? +routeQuery?.mdCode : undefined
  };
  Toast.loading({
    duration: 0,
    forbidClick: true
  });
  requestApi.innerOrgList(params).then(res => {
    const { data } = res;
    const { businessTreeList, empInfoList, pathNodeList } = data?.insideOrganizationBO || {};
    breadList.value = pathNodeList || [];
    listData.orgList = businessTreeList || [];
    listData.userList = handleUserList(empInfoList || []);
    isEmpty.value = listData.userList.length === 0 &&
      listData.orgList.length === 0 &&
      (!businessTreeList || businessTreeList?.length === 0) &&
      (!empInfoList || empInfoList?.length === 0);
  }).finally(() => {
    Toast.clear();
  });
};

// 获取关联组织列表
const getRelateListData = () => {
  const params = {
    businessTreeMdCode: routeQuery?.mdCode ? +routeQuery?.mdCode : undefined,
    rootMdCode: routeQuery?.rootMdCode ? +routeQuery?.rootMdCode : undefined
  };
  Toast.loading({
    duration: 0,
    forbidClick: true
  });
  requestApi.relateOrgList(params).then(res => {
    const { businessTreeList, empInfoList, pathNodeList } = res?.data || {};
    breadList.value = pathNodeList || [];
    listData.orgList = businessTreeList || [];
    listData.userList = handleUserList(empInfoList || []);
    isEmpty.value = listData.userList.length === 0 &&
      listData.orgList.length === 0 &&
      (!businessTreeList || businessTreeList?.length === 0) &&
      (!empInfoList || empInfoList?.length === 0);
  }).finally(() => {
    Toast.clear();
  });
};

// 搜索框点击组织回调
const onSearchJumpOrg = (obj) => {
  if (!isCreateGroup.value && !isInviteToGroup.value) {
    itemRef.value.onClickItem(obj, true);
  } else {
    checkItemRef.value.onClickOrg(obj);
  }
};

const onBack = () => {
  if (history.delta > 0) {
    history.delta--;
  }
};

onMounted(() => {
  getJobConfig();
  if (isRelateOrg.value) {
    getRelateListData();
  } else {
    getListData();
  }
  window.addEventListener('popstate', onBack);
});

onUnmounted(() => {
  window.removeEventListener('popstate', onBack);
});

onBeforeRouteLeave((to, from) => {
  history.delta = 0;
});

</script>

<style lang="scss" scoped>
.top-wrap {
  :deep(.app-nav-bar-wrapper) {
    position: fixed !important;
  }
  .full-wrap {
    width: 100%;
    height: var(--van-nav-bar-height);
  }
}
.list-wrap {
  width: 100%;
  box-sizing: border-box;
  padding: 0 0 12px;
  padding-bottom: 12px !important;
  padding-bottom: calc($safe-area-inset-bottom + 12px) !important;
  margin-top: 10px;
  .group-wrap {
    width: 100%;
    padding: 16px 20px;
    background: #FFFFFF;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
    //border-radius: 6px;
    box-sizing: border-box;
  }
}
</style>
