import type { Level } from '@/design/tokens';

/** 徽章 */
export type Badge = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  /** 已获得的时间；未获得为 null */
  earnedAt: string | null;
  /** 未获得时的进度 0-1 */
  progress: number;
  progressText: string;
};

export const mockBadges: Badge[] = [
  {
    id: 'first-unit',
    name: '第一次闯关',
    desc: '完成第一个单元',
    icon: 'i-star',
    earnedAt: '11/03',
    progress: 1,
    progressText: '已完成',
  },
  {
    id: 'three-in-row',
    name: '连续三天',
    desc: '连续 3 天完成今日任务',
    icon: 'i-review',
    earnedAt: '11/05',
    progress: 1,
    progressText: '已完成',
  },
  {
    id: 'all-right',
    name: '全对一次',
    desc: '一个单元全部一次答对',
    icon: 'i-check',
    earnedAt: '11/04',
    progress: 1,
    progressText: '已完成',
  },
  {
    id: 'word-collector',
    name: '词卡收集者',
    desc: '收集 20 个词',
    icon: 'i-card',
    earnedAt: null,
    progress: 0.7,
    progressText: '14/20',
  },
  {
    id: 'speak-up',
    name: '敢开口',
    desc: '完成 10 次跟读',
    icon: 'i-mic',
    earnedAt: null,
    progress: 0.3,
    progressText: '3/10',
  },
  {
    id: 'perfect-week',
    name: '满勤一周',
    desc: '连续 7 天完成今日任务',
    icon: 'i-trophy',
    earnedAt: null,
    progress: 0.71,
    progressText: '5/7',
  },
];

/** 宝箱状态 */
export type ChestState = {
  /** 还需几关 */
  remaining: number;
  /** 总需几关 */
  required: number;
  /** 是否有可领取的宝箱（remaining === 0） */
  claimable: boolean;
  /** 累计开箱次数 */
  openedCount: number;
};

export const mockChest: ChestState = {
  remaining: 2,
  required: 5,
  claimable: false,
  openedCount: 12,
};

/** 装扮商店（P2 内容，先占位） */
export type ShopItem = {
  id: string;
  name: string;
  price: number;
  owned: boolean;
  level: Level;
};

export const mockShop: ShopItem[] = [
  { id: 'hat', name: '小皇冠', price: 50, owned: true, level: 'kids-a' },
  { id: 'cape', name: '披风', price: 80, owned: false, level: 'kids-a' },
  { id: 'pet', name: '宠物小猫', price: 120, owned: false, level: 'kids-a' },
];
