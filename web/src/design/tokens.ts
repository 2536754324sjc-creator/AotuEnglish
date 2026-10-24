/**
 * 设计令牌 —— 数值全部取自已验证的原型 design/kid/map.html。
 * 改这里的值会影响全站；不要在各页面里另写十六进制颜色。
 */

export const palette = {
  sky1: '#f2f9ff',
  sky2: '#dceeff',
  ink: '#12233f',
  ink2: '#40567a',
  ink3: '#6f86a6',
  blue: '#2f7cf6',
  blueStrong: '#1f66db',
  blueDeep: '#15479e',
  blueSoft: '#e8f2ff',
  sun: '#ffc53d',
  sunDeep: '#e7a100',
  green: '#39b96b',
  greenDeep: '#228a4c',
  greenSoft: '#e4f7ea',
  white: '#ffffff',
  line: '#d7e6f7',
  locked: '#9bb0cb',
} as const;

export const radius = {
  sm: 18,
  md: 24,
  lg: 32,
  pill: 999,
} as const;

/** 厚实按钮的硬阴影：静止 7px、按下收到 2px */
export const shadow = {
  sm: '0 4px 0 rgba(18,35,63,.06), 0 10px 22px rgba(18,35,63,.08)',
  md: '0 10px 0 rgba(18,35,63,.07), 0 22px 40px rgba(18,35,63,.12)',
  button: '0 7px 0 #15479e',
  buttonPressed: '0 2px 0 #15479e',
} as const;

/** 触控目标：孩子档全部不小于 64px */
export const touch = {
  min: 64,
  pictureCard: 200,
} as const;

export const font = {
  /** 英文/数字展示字。名字与 public/fonts/fonts.css 的 @font-face 一致 */
  display: "'Baloo 2', 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif",
  /** 中文展示字 */
  displayZh: "'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif",
  /** 正文 */
  body: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
} as const;

/** 内容档 —— 决定密度、题型配比与语气，不决定路由 */
export type Level = 'kids-a' | 'kids-b' | 'teen' | 'adult';

export type LevelConfig = {
  label: string;
  /** 地图节点尺寸：已完成 / 当前 / 未解锁 */
  nodeSize: [number, number, number];
  /** 图卡最小边长 */
  pictureCard: number;
  /** 是否显示吉祥物与气泡 */
  mascot: boolean;
  /** 每单元题数 */
  questionsPerUnit: number;
};

export const levels: Record<Level, LevelConfig> = {
  'kids-a': {
    label: '4–7 岁',
    nodeSize: [86, 138, 80],
    pictureCard: touch.pictureCard,
    mascot: true,
    questionsPerUnit: 7,
  },
  'kids-b': {
    label: '7–12 岁',
    nodeSize: [76, 120, 70],
    pictureCard: 160,
    mascot: true,
    questionsPerUnit: 8,
  },
  teen: {
    label: '13–16 岁',
    nodeSize: [64, 100, 58],
    pictureCard: 120,
    mascot: false,
    questionsPerUnit: 10,
  },
  adult: {
    label: '17+',
    nodeSize: [56, 88, 50],
    pictureCard: 120,
    mascot: false,
    questionsPerUnit: 12,
  },
};

export const defaultLevel: Level = 'kids-a';
