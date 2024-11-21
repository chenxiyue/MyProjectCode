import request from '@/utils/request';

const urlPrefix = '/cottichat';

const baseRequest = (option) => {
  option.url = urlPrefix + option.url;
  option.noClearToast = true;
  return request({
    ...option,
  });
};

export default {
  // 内部组织查询
  innerOrgList (data) {
    return baseRequest({
      url: '/addressBook/innerOrganizationMessage',
      data
    });
  },
  // 根据用户id查询用户信息
  userInfoById (data) {
    return baseRequest({
      url: '/addressBook/searchByUserUid',
      data
    });
  },
  // 关联组织
  relateOrgList (data) {
    return baseRequest({
      url: '/addressBook/associatedOrganizationMessage',
      data
    });
  },
  // 创建群组
  createGroup (data) {
    return baseRequest({
      url: '/addressBook/multipleDataSourcesCreateGroup',
      data
    });
  },
  // 邀请入群
  inviteToGroup (data) {
    return baseRequest({
      url: '/addressBook/multipleDataSourcesJoinGroup',
      data
    });
  },
  // 群组列表
  groupList (data) {
    return baseRequest({
      url: '/addressBook/groupSearch',
      data
    });
  },
  // 外部联系人列表
  externalContactList (data) {
    return baseRequest({
      url: '/addressBook/externalContact',
      data
    });
  },
  // 搜索外部联系人
  searchExternalContact (data) {
    return baseRequest({
      url: '/addressBook/searchOtherObjectUser',
      data
    });
  },
  // 新的联系人
  newContact (data) {
    return baseRequest({
      url: '/addressBook/newContactPersonList',
      data
    });
  },
  // 申请人信息
  applyInfo (data) {
    return baseRequest({
      url: '/addressBook/getApplyMessage',
      data,
      method: 'GET'
    });
  },
  // 综合查询
  searchAll (data) {
    return baseRequest({
      url: '/addressBook/unionSearchFriendsMsg',
      data
    });
  },
  // 组织人员查询
  orgUserSearch (data) {
    return baseRequest({
      url: '/addressBook/organizationUserSearch',
      data
    });
  },
  // 获取岗位配置
  jobConfigData (data) {
    return baseRequest({
      url: '/clientConfig/jobNameFlagConfig',
      data,
      method: 'GET'
    });
  }
};
