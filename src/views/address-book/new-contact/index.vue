<template>
  <div ref="listContainerRef" class="container">
    <!--顶部导航-->
    <app-nav-bar title="新的联系人" />
    <div class="content-wrap">
      <!--添加外部联系人卡片-->
      <AddOutContactCard />
      <!--无结果-->
      <Empty v-if="showEmpty" />
      <template v-if="!showEmpty && listData.recentList.length > 0">
        <!--近三天-->
        <div class="label">近三天</div>
        <div class="list-wrap">
          <div
            v-for="(item, index) in listData.recentList"
            :key="index"
            class="item-wrap"
            @click.stop="onClickItem(item)"
          >
            <Avatar :name="item?.applyName" />
            <div class="info-box">
              <div class="name-box">
                <!--主动添加时显示备注-->
                <template v-if="item?.applyType === 1 && item?.remark">
                  <span class="remark">{{ item.remark }}</span>
                  <span class="name">{{ `(${item?.applyName ?? ''})` }}</span>
                </template>
                <span v-else class="name">{{ item?.applyName ?? '' }}</span>
              </div>
              <div v-if="item?.beDesc" class="sub-text">{{ item.beDesc }}</div>
            </div>
            <div class="right-wrap">
              <!--主动添加时显示箭头-->
              <img v-if="item?.applyType === 1" class="icon" :src="addedIcon" alt="" />
              <span class="text">{{ getStatusText(item) }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-if="!showEmpty && listData.beforeList.length > 0">
        <!--三天前-->
        <div class="label">三天前</div>
        <div class="list-wrap">
          <div
            v-for="(item, index) in listData.beforeList"
            :key="index"
            class="item-wrap"
            @click.stop="onClickItem(item)"
          >
            <Avatar :name="item?.applyName" />
            <div class="info-box">
              <div class="name-box">
                <!--主动添加时显示备注-->
                <template v-if="item?.applyType === 1 && item?.remark">
                  <span class="remark">{{ item.remark }}</span>
                  <span class="name">{{ `(${item?.applyName ?? ''})` }}</span>
                </template>
                <span v-else class="name">{{ item?.applyName ?? '' }}</span>
              </div>
              <div v-if="item?.beDesc" class="sub-text">{{ item.beDesc }}</div>
            </div>
            <div class="right-wrap">
              <!--主动添加时显示箭头-->
              <img v-if="item?.applyType === 1" class="icon" :src="addedIcon" alt="" />
              <span class="text">{{ getStatusText(item) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'addressBookNewContact'
};
</script>

<script setup>
import { computed, onActivated, onDeactivated, reactive, ref, watch } from 'vue';
import AddOutContactCard from '@/view/address-book/components/add-outContact-card/index.vue';
import { useRoute, useRouter } from 'vue-router';
import addedIcon from '@/assets/images/address-book/added.svg';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import requestApi from '@/view/address-book/api/index';
import Empty from '@/view/address-book/components/empty/index.vue';
import { jsBridgeChooseContact, jsBridgeJumpPersonalPage } from '@/utils/jsbridge/bridgeRegisterHandle';
import { usePageVisibility } from '@vant/use';
import { debounce } from '@/utils/common';

const route = useRoute();
const router = useRouter();

// 路由参数
const routeQuery = route.query;

// 列表数据
const listData = reactive({
  // 近三天
  recentList: [],
  // 三天前
  beforeList: []
});

// 选择联系人名片操作时 路由参数 mode 0-创建群组，1-邀请入群，2-选择联系人卡片
const isChooseUser = computed(() => {
  return +routeQuery?.mode === 2;
});

const isEmpty = ref(false);

// 列表为空
const showEmpty = computed(() => {
  return listData.recentList?.length === 0 && listData.beforeList.length === 0 && isEmpty.value;
});

// 获取好友请求列表
const getList = () => {
  requestApi.newContact().then(res => {
    // 近三天
    const recentData = res?.data?.recentlyMessage || [];
    // 三天前
    const beforeData = res?.data?.beforeMessage || [];
    listData.recentList = recentData;
    listData.beforeList = beforeData;
    isEmpty.value = listData.recentList.length === 0 &&
      listData.beforeList.length === 0 &&
      recentData.length === 0 &&
      beforeData.length === 0;
  }).catch(() => {
    isEmpty.value = true;
  });
};

// 获取申请状态显示文本
const getStatusText = (obj) => {
  switch (obj?.authStatus) {
  case 0:
    return '待通过';
  case 1:
    return '已添加';
  case 2:
    return '已拒绝';
  default:
    return '';
  }
};

// 点击
const onClickItem = debounce((obj) => {
  // 发送联系人名片时
  if (isChooseUser.value) {
    jsBridgeChooseContact({
      userUid: obj?.userId,
      userName: obj?.name
    });
    return;
  }
  // 已通过状态，跳转联系人卡片页 (0-待通过, 1-已通过, 2-已拒绝)
  if (obj?.authStatus === 1) {
    let uid = '';
    // 申请类型 1-主动添加, 2-被其他人申请
    if (obj?.applyType === 1) {
      uid = obj?.beUserId;
    }
    if (obj?.applyType === 2) {
      uid = obj?.userId;
    }
    jsBridgeJumpPersonalPage({
      userUid: uid,
      addOrigin: obj?.applyType === 1 ? obj?.addOrigin : '' // 主动添加时告知native来源
    });
    return;
  }
  router.push({
    path: '/address-book/apply-info',
    query: {
      applyId: obj?.applyId,
      applyType: obj?.applyType
    }
  });
}, 500, true);

const listContainerRef = ref();

// 页面滚动距离
const scrollTop = ref(0);

// 页面滚动
const pageScroll = (e) => {
  scrollTop.value = e.target.scrollTop;
};

const initPage = () => {
  getList();
  if (scrollTop.value) {
    listContainerRef.value.scrollTop = scrollTop.value;
  }
};

const pageVisibility = usePageVisibility();

watch(pageVisibility, (nval, oval) => {
  if (nval === 'visible' && oval === 'hidden') {
    initPage();
  }
});

onActivated(() => {
  listContainerRef.value.addEventListener('scroll', pageScroll);
  initPage();
});

onDeactivated(() => {
  listContainerRef.value.removeEventListener('scroll', pageScroll);
});

</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  .content-wrap {
    box-sizing: border-box;
    padding: 12px 0;
    .label {
      padding: 0 20px;
      font-size: 14px;
      color: #646A77;
      margin-top: 16px;
    }
    .list-wrap {
      width: 100%;
      box-sizing: border-box;
      background: #FFFFFF;
      box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
      //border-radius: 6px;
      margin-top: 12px;
      padding: 16px 20px;
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
            @include ellipsis(1);
          }
        }
        .right-wrap {
          display: flex;
          align-items: center;
          margin-left: auto;
          flex-shrink: 0;
          .icon {
            width: 13px;
            height: 13px;
            margin-right: 6px;
          }
          .text {
            font-size: 13px;
            font-weight: 400;
            color: #999999;
          }
        }
      }
    }
  }
}
</style>
