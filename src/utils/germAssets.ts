// assets/germs/의 실제 세균 사진 10종 전부. Metro가 애셋을 번들에 포함하려면
// require() 인자가 정적 문자열이어야 하므로 여기 한 곳에 모아둔다.
export const GERM_ASSET_MODULES = [
  require('../../assets/germs/germ1.png'),
  require('../../assets/germs/germ2.png'),
  require('../../assets/germs/germ3.png'),
  require('../../assets/germs/germ4.png'),
  require('../../assets/germs/germ5.png'),
  require('../../assets/germs/germ6.png'),
  require('../../assets/germs/germ7.png'),
  require('../../assets/germs/germ8.png'),
  require('../../assets/germs/germ9.png'),
  require('../../assets/germs/germ10.png'),
];

export const GERM_ASSET_COUNT = GERM_ASSET_MODULES.length;
