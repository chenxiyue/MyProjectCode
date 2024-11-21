<template>
  <div>
    <!--顶部导航-->
    <app-nav-bar />
    <!--顶部头像-->
    <div class="top-wrap">
      <Avatar :name="applyInfo?.name" width="90px" height="90px" fontSize="33px" />
      <div class="name-box">
        <div class="name">{{ applyInfo?.name }}</div>
        <div v-if="applyInfo?.imShowName" class="sub-text">{{ `@${applyInfo?.imShowName}` }}</div>
      </div>
    </div>
    <!--工号部门信息，查看被申请信息时显示-->
    <template v-if="isApplied">
      <van-cell-group class="cell-group" inset>
        <van-cell title="工号" :border="false">
          <template #value>
            <div class="copy-wrap">
              <span>{{ applyInfo?.empCode }}</span>
              <Copy v-if="applyInfo?.empCode" :copyText="applyInfo?.empCode" style="margin-left: 4px;" />
            </div>
          </template>
        </van-cell>
        <van-cell title="部门" :value="applyInfo?.deptName" :border="false" />
        <van-cell title="岗位" :value="jobText" />
      </van-cell-group>
    </template>
    <!--申请原因-->
    <van-cell-group class="cell-group" inset>
      <van-cell title="申请原因" :value="applyInfo?.beDesc" />
    </van-cell-group>
    <!--来源 查看被申请信息时显示-->
    <van-cell-group v-if="isApplied" class="cell-group" inset>
      <van-cell title="来源" :value="addOriginText" />
    </van-cell-group>
    <!--备注 查看主动申请信息时显示-->
    <!--<van-cell-group v-if="!isApplied" class="cell-group" inset>-->
    <!--  <van-cell title="备注" :value="applyInfo?.remark" />-->
    <!--</van-cell-group>-->
    <!--按钮 非好友关系时显示-->
    <div v-if="applyInfo?.isFriend === 0" class="btn-wrap">
      <!--主动申请时显示-->
      <template v-if="!isApplied">
        <!--待通过状态时显示-->
        <div v-if="applyInfo?.authStatus === 0" class="single-btn">等待对方同意</div>
        <!--已拒绝状态时显示-->
        <van-button
          v-if="applyInfo?.authStatus === 2"
          class="single-btn"
          @click.stop="resendApply"
        >重新发送好友申请</van-button>
      </template>
      <!--被申请 & 待通过状态时显示-->
      <div v-if="isApplied && applyInfo?.authStatus === 0" class="two-btn">
        <van-button class="btn small" @click.stop="onRejectFriend">拒绝</van-button>
        <van-button class="btn big" @click.stop="onAgreeFriend">同意申请</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import Copy from '@/components/copy/index.vue';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import requestApi from '@/view/address-book/api/index';
import { jsBridgeAgreeFriendRequest, jsBridgeRejectFriendRequest } from '@/utils/jsbridge/bridgeRegisterHandle';
import { routerBack } from 'platform-lib-app';
import { debounce } from '@/utils/common';

const route = useRoute();

const router = useRouter();

// 路由参数
const routeQuery = route.query;

// 判断是否被其他人申请
const isApplied = computed(() => {
  return +routeQuery?.applyType === 2;
});

// 申请信息
const applyInfo = ref(null);

// 处理岗位信息
const jobText = computed(() => {
  return applyInfo.value?.jobName?.length > 0 ? applyInfo.value.jobName.join('&') : '';
});

// 获取申请信息
const getApplyInfo = () => {
  return new Promise(resolve => {
    const params = {
      applyId: +routeQuery?.applyId
    };
    requestApi.applyInfo(params).then(res => {
      const data = res?.data || {};
      applyInfo.value = data;
      resolve(data);
    }).catch(() => {
      resolve(null);
    });
  });
};

// 处理申请来源文本
const addOriginText = computed(() => {
  const origin = applyInfo.value?.addOrigin;
  switch (origin) {
  case 1:
    return '通过搜索工号添加';
  case 2:
    return '通过搜索手机号添加';
  case 3:
    return '通过聊天组件添加';
  case 4:
    return '通过关联组织添加';
  default:
    return '';
  }
});

// 拒绝
const onRejectFriend = debounce(async () => {
  const result = await jsBridgeRejectFriendRequest({
    userUid: applyInfo.value?.userUid
  });
  console.log('拒绝bridge回调: ', result);
  if (result) {
    const res = await getApplyInfo();
    if (res) {
      routerBack();
    }
  }
}, 500, true);

// 同意
const onAgreeFriend = debounce(async () => {
  const result = await jsBridgeAgreeFriendRequest({
    userUid: applyInfo.value?.userUid
  });
  console.log('同意bridge回调: ', result);
  if (result) {
    const res = await getApplyInfo();
    if (res) {
      routerBack();
    }
  }
}, 500);

// 重新发送申请
const resendApply = debounce(() => {
  router.push({
    path: '/address-book/out-contact/add',
    query: {
      userUid: applyInfo.value?.userUid,
      addOrigin: applyInfo.value?.addOrigin,
      reason: applyInfo.value?.beDesc,
      remark: applyInfo.value?.remark
    }
  });
}, 500, true);

onMounted(() => {
  getApplyInfo();
});

</script>

<style lang="scss" scoped>
.top-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 20px;
  background: #FFFFFF;
  box-sizing: border-box;
  .name-box {
    margin-left: 12px;
    .name {
      font-size: 20px;
      color: #333333;
      line-height: 20px;
    }
    .sub-text {
      margin-top: 12px;
      font-size: 16px;
      font-weight: 400;
      color: #999999;
      line-height: 16px;
    }
  }
}
.cell-group {
  border-radius: 0;
  margin: 12px 0;
  box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
  :deep(.van-cell) {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
  :deep(.van-cell__title) {
    flex: unset;
    flex-shrink: 0;
    width: 70px;
  }
  :deep(.van-cell__value) {
    display: flex;
    justify-content: flex-end;
    text-align: left;
    flex: unset;
    flex-grow: 1;
    word-break: break-word;
  }
  .copy-wrap {
    display: flex;
    justify-content: flex-end;
  }
}
.btn-wrap {
  width: 100%;
  margin-top: 24px;
  padding: 0 20px;
  box-sizing: border-box;
  .single-btn {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    background: $primary-color;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
    border-radius: 6px;
    color: #FFFFFF;
  }
  .two-btn {
    display: flex;
    width: 100%;
    .btn {
      height: 50px;
      box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
      border-radius: 6px;
      &.small {
        width: 123px;
        background: #FFFFFF;
      }
      &.big {
        margin-left: 12px;
        flex: 1;
        background: $primary-color;
        color: #FFFFFF;
      }
    }
  }
}
</style>
