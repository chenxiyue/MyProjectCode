<template>
  <div class="container">
    <!--组织内联系人-->
    <div class="card-wrap">
      <div class="item-wrap" @click.stop="handleJump('list', rootNode?.mdCode)">
        <img class="left-icon" :src="innerOrgIcon" alt="" />
        <div class="label">组织内联系人</div>
        <div class="right-wrap">
          <img class="icon" :src="arrowRightIcon" alt="" />
        </div>
      </div>
      <div v-if="curOrgData && curOrgData?.name" class="inner-wrap" @click.stop="handleJump('list', curOrgData?.mdCode)">
        <img class="left-icon" :src="subOrgIcon" alt="" />
        <div class="label">{{ curOrgData.name }}</div>
        <div class="right-wrap">
          <img class="icon" :src="arrowRightIcon" alt="" />
        </div>
      </div>
    </div>
    <!--关联组织 关联组织列表大于0时显示-->
    <div v-if="relateOrgList?.length > 0" class="card-wrap">
      <div class="item-wrap" @click.stop="handleJump('relateOrg')">
        <img class="left-icon" :src="relateOrgIcon" alt="" />
        <div class="label">{{ relateOrgName }}</div>
        <div class="right-wrap">
          <img class="icon" :src="arrowRightIcon" alt="" />
        </div>
      </div>
    </div>
    <div class="card-wrap">
      <!--外部联系人-->
      <div class="item-wrap" @click.stop="handleJump('out')">
        <img class="left-icon" :src="outContractIcon" alt="" />
        <div class="label">外部联系人</div>
        <div class="right-wrap">
          <img class="icon" :src="arrowRightIcon" alt="" />
        </div>
      </div>
      <!--新的联系人-->
      <div v-if="!isCreateGroup && !isInviteToGroup && !isChooseUser" class="item-wrap" @click.stop="handleJump('new')">
        <img class="left-icon" :src="newContractIcon" alt="" />
        <div class="label">新的联系人</div>
        <div class="right-wrap">
          <div v-if="newContract > 0" class="num">
            {{ newContract > 99 ? '99+' : newContract }}
          </div>
          <img class="icon" :src="arrowRightIcon" alt="" />
        </div>
      </div>
    </div>
    <!--我的群组 用户所在群组大于0时显示-->
    <div v-if="!isChooseUser && groupList?.length > 0" class="card-wrap">
      <div class="item-wrap" @click.stop="handleJump('group')">
        <img class="left-icon" :src="myGroupIcon" alt="" />
        <div class="label">我的群组</div>
        <div class="right-wrap">
          <img class="icon" :src="arrowRightIcon" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import innerOrgIcon from '@/assets/images/address-book/inner-org.svg';
import relateOrgIcon from '@/assets/images/address-book/relate-org.svg';
import outContractIcon from '@/assets/images/address-book/out-contact.svg';
import newContractIcon from '@/assets/images/address-book/new-contact.svg';
import myGroupIcon from '@/assets/images/address-book/my-group.svg';
import arrowRightIcon from '@/assets/images/address-book/arrow-right.svg';
import subOrgIcon from '@/assets/images/address-book/sub-org.svg';
import { pushUrl } from 'platform-lib-app';
import requestApi from '@/view/address-book/api/index';
import useAddressBook from '@/store/modules/addressBook';
import { usePageVisibility } from '@vant/use';
import { jsBridgeRefreshContactsBadge, jsBridgeUpdateMailListBadge } from '@/utils/jsbridge/bridgeRegisterHandle';
import { debounce } from '@/utils/index';

const route = useRoute();

const router = useRouter();

// 路由参数
const routeQuery = route.query;

const addressBookStore = useAddressBook();

const pageVisibility = usePageVisibility();

// 主体信息
const subjectData = inject('subjectData');

// 判断是否是联营商
const isJoint = computed(() => {
  const { loginuser } = subjectData.value || {};
  return loginuser?.emp?.innerFlag === 3;
});

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

// 组织根节点数据
const rootNode = ref(null);

// 当前所在组织
const curOrgData = ref(null);

// 新的联系人数量
const newContract = ref(0);

// 所在群列表
const groupList = ref([]);

// 关联组织列表
const relateOrgList = ref([]);

// 关联组织名称
const relateOrgName = ref('');

// 获取所在组织数据
const getData = () => {
  requestApi.innerOrgList().then(res => {
    const { insideOrganizationBO, mgtDept } = res?.data || {};
    const { businessTreeList } = insideOrganizationBO || {};
    rootNode.value = businessTreeList?.length > 0 ? businessTreeList[0] : null;
    curOrgData.value = mgtDept;
  });
};

// 获取新的联系人数量
const getContractNum = (norefresh = undefined) => {
  requestApi.newContact().then(res => {
    const { waitNumber } = res?.data || {};
    newContract.value = waitNumber;
    // native通知h5时不需再次通知native刷新角标
    if (!norefresh) {
      jsBridgeUpdateMailListBadge();
    }
  });
};

// 获取群组列表
const getGroupList = () => {
  requestApi.groupList().then(res => {
    const { data } = res;
    groupList.value = data || [];
  });
};

// 获取关联组织列表
const getRelateOrgList = () => {
  requestApi.relateOrgList().then(res => {
    const { associatedOrgFlagName, businessTreeList } = res?.data || {};
    relateOrgList.value = businessTreeList || [];
    relateOrgName.value = associatedOrgFlagName || '';
  });
};

// 跳转
const handleJump = debounce((type, code = undefined) => {
  let url = '';
  const query = { ...routeQuery };
  switch (type) {
  case 'list':
    url = '/address-book/list';
    query.mdCode = code;
    break;
  case 'relateOrg':
    url = '/address-book/list';
    query.relateOrg = 1;
    query.isRoot = 1; // 用来标识是否是根节点
    query.isJoint = isJoint.value ? 1 : 0;
    break;
  case 'out':
    url = '/address-book/out-contact';
    break;
  case 'new':
    url = '/address-book/new-contact';
    break;
  case 'group':
    url = isCreateGroup.value || isInviteToGroup.value ? '/address-book/my-group-select' : '/address-book/my-group';
    break;
  default:
    break;
  }
  if (isCreateGroup.value || isInviteToGroup.value || isChooseUser.value) {
    addressBookStore.setSubRouteQuery(query);
    router.push({
      path: url,
      query
    });
  } else {
    pushUrl(url, JSON.stringify(query) === '{}' ? null : query);
  }
}, 500, true);

// 加载页面数据
const loadPageData = () => {
  getData();
  getGroupList();
  getRelateOrgList();
  if (!isCreateGroup.value && !isInviteToGroup.value) {
    getContractNum();
  }
};

watch(pageVisibility, (nval, oval) => {
  if (nval === 'visible' && oval === 'hidden') {
    loadPageData();
  }
});

loadPageData();

jsBridgeRefreshContactsBadge({ complete: getContractNum });

</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  //padding: 0 12px;
  box-sizing: border-box;
  .card-wrap {
    width: 100%;
    background: #FFFFFF;
    margin-top: 12px;
    padding: 14px 20px;
    box-sizing: border-box;
    box-shadow: -2px 6px 10px 0px rgba(137,168,202,0.1);
    //border-radius: 6px;
    .item-wrap {
      width: 100%;
      .left-icon {
        width: 22px;
        height: 22px;
      }
    }
    .inner-wrap {
      padding-left: 36px;
      .left-icon {
        width: 16px;
        height: 16px;
      }
    }
    .item-wrap, .inner-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 28px;
      &:last-child {
        margin-bottom: 0;
      }
      .label {
        margin-left: 12px;
        font-size: 16px;
        color: #333333;
      }
      .right-wrap {
        margin-left: auto;
        display: flex;
        align-items: center;
        .icon {
          width: 20px;
          height: 20px;
        }
        .num {
          min-width: 16px;
          height: 16px;
          line-height: 16px;
          padding: 2px;
          background: #FF1600;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: #FFFFFF;
          text-align: center;
          margin-right: 4px;
        }
      }
    }
  }
}
</style>
