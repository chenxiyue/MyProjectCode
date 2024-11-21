<template>
  <div>
    <!--顶部导航-->
    <app-nav-bar title="我的群组">
      <template #right>
        <div class="nav-bar-right" @click.stop="createGroup">创建群组</div>
      </template>
    </app-nav-bar>
    <!--列表-->
    <div v-if="listData?.length > 0" class="list-wrap">
      <div class="list-group">
        <div
          class="item-wrap"
          v-for="(item, index) in listData"
          :key="index"
          @click.stop="onClickItem(item)"
        >
          <Avatar :name="item?.groupName" :isGroup="true" />
          <div class="name">{{ `${item?.groupName ?? ''}（${item?.groupMemberCount}）` }}</div>
        </div>
      </div>
    </div>
    <!--无结果-->
    <Empty v-if="showEmpty" />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';
import { isAppEnv } from 'platform-lib-app';
import Avatar from '@/view/address-book/components/avatar/index.vue';
import requestApi from '@/view/address-book/api/index';
import Empty from '@/view/address-book/components/empty/index.vue';
import { jsBridgeCreateGroupFromH5, jsBridgeNavigateToGroupChat } from '@/utils/jsbridge/bridgeRegisterHandle';
import { usePageVisibility } from '@vant/use';
import { debounce } from '@/utils/common';

const route = useRoute();

const router = useRouter();

const routeQuery = route.query;

// 列表数据
const listData = ref([]);

// 无结果
const isEmpty = ref(false);

// 是否显示无搜索结果UI
const showEmpty = computed(() => {
  return listData.value.length === 0 && isEmpty.value;
});

// 获取群组列表
const getGroupList = () => {
  requestApi.groupList().then(res => {
    const { data } = res;
    listData.value = data || [];
    isEmpty.value = listData.value.length === 0 && data?.length === 0;
  }).catch(() => {
    isEmpty.value = true;
  });
};

// 创建群组
const createGroup = debounce(() => {
  if (isAppEnv) {
    jsBridgeCreateGroupFromH5();
  } else {
    router.push({
      path: '/address-book/index',
      query: {
        mode: 0
      }
    });
  }
}, 500, true);

// 点击进去群聊界面
const onClickItem = debounce((obj) => {
  jsBridgeNavigateToGroupChat({
    groupId: obj?.groupId,
    groupName: obj?.groupName
  });
}, 500, true);

const pageVisibility = usePageVisibility();

watch(pageVisibility, (nval, oval) => {
  if (nval === 'visible' && oval === 'hidden') {
    getGroupList();
  }
});

onMounted(() => {
  getGroupList();
});

</script>

<style lang="scss" scoped>
.nav-bar-right {
  font-size: 16px;
  color: #CD4444;
  width: 80px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.list-wrap {
  width: 100%;
  box-sizing: border-box;
  //padding: 0 12px;
  margin-top: 12px;
  .list-group {
    width: 100%;
    padding: 16px 20px;
    box-sizing: border-box;
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
      .name {
        margin-left: 12px;
        font-size: 16px;
        color: #333333;
      }
    }
  }
}
</style>
