<template>
  <div>
    <!--顶部导航-->
    <app-nav-bar title="添加外部联系人" />
    <!--表单-->
    <van-form @submit="onSubmit">
      <van-cell-group class="cell-group" inset>
        <div class="form-wrap">
          <!--申请原因-->
          <van-field
            class="custom-field"
            id="reason"
            v-model="formData.reason"
            label="申请原因"
            type="textarea"
            rows="2"
            maxlength="100"
            :autosize="{
              maxHeight: 300
            }"
            :border="false"
          />
          <!--设置备注-->
          <!--<van-field-->
          <!--  class="custom-field mt"-->
          <!--  id="remark"-->
          <!--  v-model="formData.remark"-->
          <!--  label="设置备注"-->
          <!--  rows="1"-->
          <!--  maxlength="30"-->
          <!--  autosize-->
          <!--  type="textarea"-->
          <!--  @input="onRemarkInput"-->
          <!--/>-->
        </div>
      </van-cell-group>
      <!--底部按钮-->
      <div class="footer-wrap">
        <van-button
          class="btn"
          type="primary"
          native-type="submit"
          :loading="submitLoading"
        >发送申请</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
// 提交按钮加载中
import { onMounted, reactive, ref } from 'vue';
import { Toast } from 'vant';
import { jsBridgeAddFriendRequest } from '@/utils/jsbridge/bridgeRegisterHandle';
import { useRoute, useRouter } from 'vue-router';
import { getSubjectInfo } from '@/utils/jsbridge/webEntrance';
import { debounce } from '@/utils/common';

const submitLoading = ref(false);

const route = useRoute();

const router = useRouter();

const routeQuery = route.query;

// 表单数据
const formData = reactive({
  reason: '',
  remark: ''
});

// 校验规则
const formRules = {
  reason: { required: true, message: '请填写申请原因' }
};

// 获取主体信息
const getSubjectData = async () => {
  const res = await getSubjectInfo();
  const { emp } = res?.loginuser || {};
  const subject = res?.subject || {};
  // 主体名称
  const subjectName = subject?.name || '';
  // 筛选出主岗
  const mainPost = emp?.postList?.filter(i => i?.assignType === 1);
  // 岗位
  const post = mainPost?.length > 0 ? mainPost[0]?.name : '';
  // 名字
  const name = emp?.name || '';
  formData.reason = `我是${subjectName ? subjectName + '的' : ''}${post ? post + ': ' : ''}${name}`;
};

// 校验表单
const validateForm = (form, cb) => {
  let result = true;
  for (const k of Object.keys(form)) {
    const v = form[k];
    const isRequired = formRules[k]?.required;
    const validator = formRules[k]?.validator;
    if (isRequired) {
      if (validator) {
        const cbResult = validator(v, form);
        if (!cbResult) {
          result = false;
          break;
        }
      } else if (v === undefined || v === null || v.trim() === '' || (Array.isArray(v) && v.length === 0)) {
        result = false;
        const message = formRules[k].message;
        Toast(message);
        break;
      }
    }
  }
  if (result) {
    cb && cb();
  }
};

// 监听备注输入
const onRemarkInput = (e) => {
  let val = e.target.value;
  val = val.replace(/\n|\r/g, '');
  formData.remark = val;
};

// 提交表单
const onSubmit = debounce(() => {
  validateForm(formData, async () => {
    const params = {
      userUid: routeQuery?.userUid ? +routeQuery?.userUid : undefined,
      requestInfo: formData.reason,
      remark: formData.remark,
      addOrigin: +routeQuery?.addOrigin // 1-工号, 2-手机号
    };
    const result = await jsBridgeAddFriendRequest(params);
    if (result) {
      Toast('发送成功');
      setTimeout(() => {
        router.back();
      }, 1000);
    }
  });
}, 500, true);

// 处理表单赋值
const formDefaultData = () => {
  const { reason, remark } = routeQuery;
  formData.reason = reason || '';
  formData.remark = remark || '';
};

onMounted(() => {
  if (!routeQuery?.reason) {
    getSubjectData();
  }
  formDefaultData();
});

</script>

<style lang="scss" scoped>
.cell-group {
  border-radius: 0;
  margin: 12px 0;
  .form-wrap {
    padding: 12px 20px;
    .custom-field {
      display: block;
      padding: 0;
      :deep(.van-field__label) {
        font-size: 14px;
        font-weight: normal;
        color: #646A77;
      }
      :deep(.van-field__value) {
        box-sizing: border-box;
        margin-top: 12px;
        padding: 12px;
        background: #F3F4F6;
        border-radius: 6px;
        .van-field__control {
          font-size: 16px;
          font-weight: normal;
          color: #333333;
        }
      }
      &.mt {
        margin-top: 24px;
      }
    }
  }
}
.footer-wrap {
  width: 100%;
  box-sizing: border-box;
  margin-top: 24px;
  padding: 0 20px;
  .btn {
    width: 100%;
    height: 50px;
    background: $primary-color;
    box-shadow: -2px 6px 10px 0 rgba(137, 168, 202, 0.1);
    border-radius: 6px;
    font-size: 18px;
    font-weight: normal;
    color: #FFFFFF;
  }
}
</style>
