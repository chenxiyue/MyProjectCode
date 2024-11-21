import MD5 from '@/utils/request/md5';

import org0Icon from '@/assets/images/address-book/avatar/org-0.png';
import org1Icon from '@/assets/images/address-book/avatar/org-1.png';
import org2Icon from '@/assets/images/address-book/avatar/org-2.png';
import org3Icon from '@/assets/images/address-book/avatar/org-3.png';
import org4Icon from '@/assets/images/address-book/avatar/org-4.png';
import org5Icon from '@/assets/images/address-book/avatar/org-5.png';
import org6Icon from '@/assets/images/address-book/avatar/org-6.png';
import org7Icon from '@/assets/images/address-book/avatar/org-7.png';
import org8Icon from '@/assets/images/address-book/avatar/org-8.png';
import org9Icon from '@/assets/images/address-book/avatar/org-9.png';

// 根据用户昵称生成0-9随机值
export const generateIndexByNickname = (nickname) => {
  // 生成哈希值
  const hash = MD5.hex_md5_32(nickname);
  // 截取哈希值后四位
  const str = hash.slice(-4);
  // 转换为整数
  const num = parseInt(str, 16);
  // 对10取模，得到索引
  const index = num % 10;
  return index;
};

// 生成随机颜色的用户头像
export const generateColorForUser = (nickname) => {
  // 定义颜色值列表
  const colors = [
    'linear-gradient(180deg, #6599FC 0%, #115DFB 100%)', 'linear-gradient(180deg, #15DCC0 0%, #00A791 100%)',
    'linear-gradient(180deg, #CFBDAD 0%, #A18875 100%)', 'linear-gradient(180deg, #0070CD 0%, #003D9F 100%)',
    'linear-gradient(180deg, #42C6C9 0%, #0587A2 100%)', 'linear-gradient(180deg, #FA897B 0%, #F46250 100%)',
    'linear-gradient(180deg, #E56868 0%, #CD4444 100%)', 'linear-gradient(180deg, #746BFF 0%, #4E40DE 100%)',
    'linear-gradient(180deg, #FFBC6D 0%, #F28202 100%)', 'linear-gradient(180deg, #FFA3D1 0%, #FF679A 100%)'
  ];
  const index = generateIndexByNickname(nickname);
  return colors[index];
};

// 生成随机颜色的群组头像
export const generateColorForGroup = (nickname) => {
  // 定义颜色值列表
  const colors = [
    org0Icon, org1Icon, org2Icon, org3Icon, org4Icon,
    org5Icon, org6Icon, org7Icon, org8Icon, org9Icon
  ];
  const index = generateIndexByNickname(nickname);
  return colors[index];
};
