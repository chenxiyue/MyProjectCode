<template>
  <div>
    <div ref="breadWrapRef" class="bread-wrap">
      <!--通讯录-->
      <div class="item" @click.stop="onClickFirst">
        <div class="name">通讯录</div>
        <img class="arrow-icon" :src="arrowRightIcon" alt="" />
      </div>
      <div
        v-for="(item, index) in list"
        :key="index"
        class="item"
        :class="{'pr': index === list.length - 1}"
        @click.stop="onClickItem(item, index)"
      >
        <div
          class="name"
          :class="{'grey-text': index === list.length - 1}"
        >{{ item?.name ?? '' }}</div>
        <img v-if="index !== list.length - 1" class="arrow-icon" :src="arrowRightIcon" alt="" />
      </div>
    </div>
    <!--填充高度-->
    <div class="full-wrap" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import history from '../../config/history';
import { jsBridgepclosePage } from '@/utils/jsbridge/bridgeRegisterHandle';
import arrowRightIcon from '@/assets/images/address-book/arrow-right.svg';

const route = useRoute();

const router = useRouter();

// 路由参数
const routeQuery = route.query;

const breadWrapRef = ref();

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
});

// 是否是创建群组 路由参数 mode 0-创建群组，1-邀请入群，2-选择联系人卡片
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

// 点击"通讯录"节点
const onClickFirst = () => {
  if (isCreateGroup.value || isInviteToGroup.value || isChooseUser.value) {
    if (history.delta > 0) {
      router.go(history.delta * -1);
      setTimeout(() => {
        router.push({
          path: '/address-book/list',
          query: {
            ...routeQuery,
            mdCode: undefined
          }
        });
      }, 10);
    }
  } else {
    jsBridgepclosePage();
  }
};

// 点击组织节点
const onClickItem = (obj, index) => {
  if (index === props.list.length - 1) {
    return;
  }
  if (history.delta > 0) {
    router.go(history.delta * -1);
    setTimeout(() => {
      router.push({
        path: '/address-book/list',
        query: {
          ...routeQuery,
          mdCode: obj?.mdCode
        }
      });
    }, 10);
  } else {
    router.replace({
      path: '/address-book/list',
      query: {
        ...routeQuery,
        mdCode: obj?.mdCode
      }
    });
  }
};

onMounted(() => {
  // 面包屑滚动到结尾处
  setTimeout(() => {
    if (breadWrapRef.value) {
      breadWrapRef.value.scrollLeft = breadWrapRef.value?.clientWidth;
    }
  }, 300);
});

</script>

<style lang="scss" scoped>
//面包屑导航高度
$OrgBreadcrumbHeight: 38px;

.bread-wrap {
  position: fixed;
  width: 100%;
  height: $OrgBreadcrumbHeight;
  padding: 12px 0 12px 20px;
  margin-top: -2px;
  box-sizing: border-box;
  display: flex;
  background: #FFFFFF;
  border-bottom: 0.5px solid #E3E3E3;
  box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
  overflow-x: auto;
  .item {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    &.pr {
      padding-right: 20px;
    }
    .name {
      font-size: 14px;
      color: #3470FF;
      &.grey-text {
        color: #646A77;
      }
    }
    .arrow-icon {
      margin: 0 4px;
      width: 18px;
      height: 16px;
    }
  }
}
.full-wrap {
  width: 100%;
  height: $OrgBreadcrumbHeight;
}
</style>
