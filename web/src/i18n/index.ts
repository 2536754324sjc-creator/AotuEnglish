/**
 * 文案字典 —— 页面里不写死中文，全部走这里。
 * 现在只有 zh；成人档要英文界面时加一份 en，页面代码不动。
 */

export type Locale = 'zh' | 'en';

/** 结构类型：只约束形状为 { 分组: { key: string } }，不锁死具体字面量 */
type DictShape = {
  [group: string]: { [key: string]: string };
};

export type Dict = DictShape;

export const zh = {
  common: {
    appName: 'AotuEnglish',
    continue: '继续',
    start: '开始',
    tryAgain: '再试一次',
    check: '检查一下',
    next: '下一个',
    close: '关闭',
    cancel: '取消',
    save: '保存',
    loading: '加载中',
    retry: '重试',
    back: '返回',
  },
  nav: {
    courses: '课程',
    pricing: '价格',
    help: '帮助',
    login: '登录',
    signup: '注册',
    freeTrial: '免费体验一节课',
    backToLearning: '继续学习',
  },
  learn: {
    todayLabel: '今日',
    starTotal: '{count} 颗星星',
    sound: '声音',
    pause: '先停一下',
    pauseTitle: '先到这里？',
    pauseDesc: '回来以后从第 {unit} 关接着玩。',
    resume: '继续学习',
    leave: '今天先到这里',
    lockedHint: '先完成第 {unit} 关，才能解锁这一关',
    chestProgress: '再 {count} 关开宝箱',
    unitMeta: '{words} 个单词 · 约 {minutes} 分钟',
    startUnit: '开始第 {unit} 关',
    reviewUnit: '再练一次',
    unitLocked: '尚未解锁',
    quitTitle: '现在走，这关就重新开始',
    quitDesc: '已经做过的题不会保留。',
    quitConfirm: '还是走吧',
    quitStay: '继续做题',
    correct: 'Great!',
    wrongHint: '再试一次，你可以的',
    progressLabel: '第 {current} 题，共 {total} 题',
  },
  course: {
    listenChooseImage: '听一听，选出正确的图',
    repeatWord: '跟着读一遍',
    blendSounds: '把声音拼起来',
    tapToRead: '点一下听发音',
    readChoose: '读一读，选出答案',
  },
  report: {
    minutes: '分钟',
    unitsDone: '个单元',
    streak: '连续 {days} 天',
    dailyMinutes: '每日时长',
    weakSounds: '薄弱环节',
    practiceNow: '去练一练',
    unitMastery: '单元掌握',
    detail: '明细',
    empty: '这周还没开始',
  },
  levels: {
    'kids-a': '4–7 岁',
    'kids-b': '7–12 岁',
    teen: '13–16 岁',
    adult: '17+',
  },
} as const;

const en: Dict = {
  common: {
    appName: 'AotuEnglish',
    continue: 'Continue',
    start: 'Start',
    tryAgain: 'Try again',
    check: 'Check',
    next: 'Next',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading',
    retry: 'Retry',
    back: 'Back',
  },
  nav: {
    courses: 'Courses',
    pricing: 'Pricing',
    help: 'Help',
    login: 'Log in',
    signup: 'Sign up',
    freeTrial: 'Try a free lesson',
    backToLearning: 'Back to learning',
  },
  learn: {
    todayLabel: 'Today',
    starTotal: '{count} stars',
    sound: 'Sound',
    pause: 'Pause',
    pauseTitle: 'Stop here?',
    pauseDesc: 'Come back and continue from unit {unit}.',
    resume: 'Continue',
    leave: 'Stop for today',
    lockedHint: 'Finish unit {unit} to unlock this one',
    chestProgress: '{count} more to open the chest',
    unitMeta: '{words} words · about {minutes} min',
    startUnit: 'Start unit {unit}',
    reviewUnit: 'Practice again',
    unitLocked: 'Locked',
    quitTitle: 'Leave now and this unit restarts',
    quitDesc: 'Answers you already gave will not be kept.',
    quitConfirm: 'Leave',
    quitStay: 'Keep going',
    correct: 'Great!',
    wrongHint: 'Not quite — try again',
    progressLabel: 'Question {current} of {total}',
  },
  course: {
    listenChooseImage: 'Listen and pick the right picture',
    repeatWord: 'Say it after you hear it',
    blendSounds: 'Blend the sounds',
    tapToRead: 'Tap to hear it',
    readChoose: 'Read and choose',
  },
  report: {
    minutes: 'min',
    unitsDone: 'units',
    streak: '{days}-day streak',
    dailyMinutes: 'Daily minutes',
    weakSounds: 'Needs work',
    practiceNow: 'Practice now',
    unitMastery: 'Unit mastery',
    detail: 'Details',
    empty: 'Nothing yet this week',
  },
  levels: {
    'kids-a': 'Ages 4–7',
    'kids-b': 'Ages 7–12',
    teen: 'Ages 13–16',
    adult: '17+',
  },
};

const dicts: Record<Locale, Dict> = { zh, en };

export function getDict(locale: Locale = 'zh'): Dict {
  return dicts[locale] ?? zh;
}

/** 极简插值：t('learn.unitMeta', { words: 8, minutes: 5 }) */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}
