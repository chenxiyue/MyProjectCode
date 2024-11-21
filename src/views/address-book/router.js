export default [
  {
    path: '/address-book',
    name: 'addressBook',
    redirect: '/address-book/index',
    component: () => import('./layout/index.vue'),
    meta: {
      name: '通讯录',
      routerViewKey: 'addressBookList'
    },
    children: [
      {
        path: '/address-book/index',
        name: 'addressBookIndex',
        component: () => import('./index/index.vue'),
        meta: {
          name: '通讯录首页',
          routerViewKey: 'addressBookList'
        }
      },
      {
        path: '/address-book/list',
        name: 'addressBookList',
        component: () => import('./list/index.vue'),
        meta: {
          name: '组织及用户列表',
          routerViewKey: 'addressBookList'
        }
      },
      {
        path: '/address-book/out-contact',
        name: 'addressBookOutContact',
        component: () => import('./out-contact/index.vue'),
        meta: {
          name: '外部联系人',
          routerViewKey: 'addressBookList'
        }
      },
      {
        path: '/address-book/my-group-select',
        name: 'addressBookMyGroupSelect',
        component: () => import('./my-group/checkbox-index.vue'),
        meta: {
          name: '我的群组-选择',
          routerViewKey: 'addressBookList'
        }
      }
    ]
  },
  {
    path: '/address-book/out-contact/search',
    name: 'addressBookOutContactSearch',
    component: () => import('./out-contact/search.vue'),
    meta: {
      name: '搜索外部联系人',
      keepAlive: true,
    }
  },
  {
    path: '/address-book/out-contact/add',
    name: 'addressBookOutContactAdd',
    component: () => import('./out-contact/add.vue'),
    meta: {
      name: '添加外部联系人'
    }
  },
  {
    path: '/address-book/new-contact',
    name: 'addressBookNewContact',
    component: () => import('./new-contact/index.vue'),
    meta: {
      name: '新的联系人'
    }
  },
  {
    path: '/address-book/apply-info',
    name: 'addressBookApplyInfo',
    component: () => import('./apply-info/index.vue'),
    meta: {
      name: '申请联系人信息'
    }
  },
  {
    path: '/address-book/my-group',
    name: 'addressBookMyGroup',
    component: () => import('./my-group/index.vue'),
    meta: {
      name: '我的群组',
      routerViewKey: 'addressBookList'
    }
  }
];
