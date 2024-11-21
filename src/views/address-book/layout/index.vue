<template>
  <div>
    <!--创建群组时显示-->
    <template v-if="isCreateGroup || isInviteToGroup || isChooseUser">
      <!--搜索框-->
      <Search
        :isCreateGroup="isCreateGroup"
        :isInviteToGroup="isInviteToGroup"
        :isChooseUser="isChooseUser"
        :placeholder="searchPlaceholder"
      />
    </template>
    <!--子路由-->
    <router-view>
      <template v-slot="{ Component }">
        <component :is="Component" :key="$route.fullPath" />
      </template>
    </router-view>
  </div>
</template>

<script setup>
import { computed, onMounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Search from './components/search/index.vue';
import requestApi from '@/view/address-book/api';
import { Toast } from 'vant';
import { jsBridgeRegisterCreateGroup, jsBridgeRegisterInviteToGroup } from '@/utils/jsbridge/bridgeRegisterHandle';
import useAddressBook from '@/store/modules/addressBook';
import { getSubjectInfo } from '@/utils/jsbridge/webEntrance';

const route = useRoute();

const router = useRouter();

// 路由参数
const routeQuery = route.query;

const addressBookStore = useAddressBook();

// 主体信息
const subjectData = ref(null);

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

// 搜索框占位符
const searchPlaceholder = computed(() => {
  return isChooseUser.value ? '搜索联系人' : '搜索联系人、部门和我的群组';
});

// 创建群
const handleCreateGroup = () => {
  return new Promise(resolve => {
    const resultObj = {
      code: 0,
      result: null
    };
    const selectList = addressBookStore.selectedList;
    const selectUids = selectList.map(i => i?.userUid).filter(i => i);
    const memberList = routeQuery?.groupMemberList ? JSON.parse(routeQuery.groupMemberList) : [];
    const uidList = [...selectUids, ...memberList];
    const gidList = selectList.map(i => i?.groupId).filter(i => i);
    // 筛选出cotti部门
    const cottiDepts = selectList.map(i => (i?.isOrg && !i?.relateOrgFlag) && i?.mdCode).filter(i => i);
    // 筛选出关联组织部门
    const relateDepts = selectList.map(i => (i?.isOrg && i?.relateOrgFlag) && i?.mdCode).filter(i => i);
    // 未选择时拦截
    if (uidList?.length === 0 && gidList?.length === 0 && cottiDepts?.length === 0 && relateDepts?.length === 0) {
      Toast('请选择联系人、部门或群组');
      resolve(resultObj);
      return;
    }
    const params = {
      groupOwnerUserUid: +routeQuery?.userUid,
      userUids: uidList,
      groupIds: gidList,
      subjectDeptMdCodes: {
        '1': cottiDepts,
        '2': relateDepts
      }
    };
    console.log('创建群聊参数: ', params);
    requestApi.createGroup(params).then(res => {
      const { status, message, groupRes } = res.data;
      if (status === 1) {
        resultObj.code = 1;
        resultObj.result = groupRes;
      } else {
        message && Toast(message);
      }
      resolve(resultObj);
    }).catch(() => {
      resolve(resultObj);
    });
  });
};

// 邀请入群
const handleInviteToGroup = () => {
  return new Promise(resolve => {
    const selectList = addressBookStore.selectedList;
    const selectUids = selectList.map(i => i?.userUid).filter(i => i);
    // const memberList = routeQuery?.groupMemberList ? JSON.parse(routeQuery.groupMemberList) : [];
    // const uidList = [...selectUids, ...memberList];
    const uidList = [...selectUids];
    const gidList = selectList.map(i => i?.groupId).filter(i => i);
    // 筛选出cotti部门
    const cottiDepts = selectList.map(i => (i?.isOrg && !i?.relateOrgFlag) && i?.mdCode).filter(i => i);
    // 筛选出关联组织部门
    const relateDepts = selectList.map(i => (i?.isOrg && i?.relateOrgFlag) && i?.mdCode).filter(i => i);
    // 未选择时拦截
    if (selectUids?.length === 0 && gidList?.length === 0 && cottiDepts?.length === 0 && relateDepts?.length === 0) {
      Toast('请选择联系人、部门或群组');
      resolve(null);
      return;
    }
    const params = {
      invitUseruid: +routeQuery?.userUid,
      groupId: +routeQuery?.groupId,
      userUids: uidList,
      groupIds: gidList,
      subjectDeptMdCodes: {
        '1': cottiDepts,
        '2': relateDepts
      }
    };
    console.log('邀请入群参数: ', params);
    requestApi.inviteToGroup(params).then(res => {
      const { status, message, joinGroupRes } = res.data;
      if (status === 1) {
        resolve(joinGroupRes);
      } else if (status === 2) {
        resolve(2);
      } else {
        message && Toast(message);
        resolve(null);
      }
    }).catch(() => {
      resolve(null);
    });
  });
};

// 注册创建群的bridge
const registBridgeCreateGroup = () => {
  jsBridgeRegisterCreateGroup({
    createGroup: async () => {
      const result = await handleCreateGroup();
      return result;
    }
  });
};

// 邀请入群
const registBridgeInviteToGroup = () => {
  jsBridgeRegisterInviteToGroup({
    inviteToGroup: async () => {
      const result = await handleInviteToGroup();
      return result;
    }
  });
};

// 获取主体信息
const getSubjectData = async () => {
  const res = await getSubjectInfo();
  subjectData.value = res;
};

provide('subjectData', subjectData);

onMounted(async () => {
  await getSubjectData();
  if (isCreateGroup.value) {
    registBridgeCreateGroup();
    addressBookStore.setSubRouteQuery(routeQuery);
  }
  if (isInviteToGroup.value) {
    registBridgeInviteToGroup();
    addressBookStore.setSubRouteQuery(routeQuery);
  }
});

</script>
