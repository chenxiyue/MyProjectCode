<template>
  <div>
    <!--联系人-->
    <div
      v-if="!isGroup && !isOrg"
      class="avatar"
      :style="{
        'background': generateColorForUser(name),
        'width': width,
        'height': height,
        'font-size': fontSize
      }"
    >{{ getTextByNickname }}</div>
    <!--群组-->
    <img v-if="isGroup" class="avatar" :src="generateColorForGroup(name)" alt="" :style="{'width': width,'height': height}" />
    <!--组织-->
    <img v-if="isOrg" class="avatar" :src="orgIcon" alt="" :style="{'width': width,'height': height}" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { generateColorForUser, generateColorForGroup } from './colourfulAvatar';
import orgIcon from '@/assets/images/address-book/org.svg';

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  isOrg: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: undefined
  },
  height: {
    type: String,
    default: undefined
  },
  fontSize: {
    type: String,
    default: undefined
  }
});

// 根据昵称获取头像中显示的文本
const getTextByNickname = computed(() => {
  const name = props.name;
  let result = '';
  if (/^[\u4e00-\u9fa5]+$/.test(name)) {
    result = name.slice(-2);
  } else if (/^[a-zA-Z]+$/.test(name) && name.length <= 5) {
    result = name;
  } else if (/^[a-zA-Z]+$/.test(name) && name.length > 5) {
    result = name.charAt(0).toUpperCase();
  } else {
    result = name.charAt(0).toUpperCase();
  }
  return result;
});

</script>

<style lang="scss" scoped>
.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
