import type { Level } from '@/design/tokens';

/**
 * 分级读物：一本书一页一句话，用图卡做插图。
 *
 * 为什么复用词卡图：
 * - 114 张图卡已经按「单词 → 画面」校对过，风格统一，零额外下载
 * - 读到的词就是学过的词，读本和词库自然闭环
 *
 * 约束：`img` 必须是 public/cards 下真实存在的 slug，
 * `node scripts/check-readings.mjs` 会校验，防止写出 404。
 */

/** 读本里的一句话：英文正文 + 中文译文 + 需要高亮的重点词 */
export type ReadingSentence = {
  en: string;
  zh: string;
  /** 高亮并可点读的词（要和 en 里的大小写拼写一致） */
  focus?: string[];
};

export type ReadingPage = {
  /** 插图 slug，对应 public/cards/{img}.jpg */
  img: string;
  imgAlt: string;
  sentence: ReadingSentence;
};

export type ReadingBook = {
  id: string;
  titleEn: string;
  titleZh: string;
  /** 难度：1 = 一词一句，2 = 短句，3 = 完整句 */
  stage: 1 | 2 | 3;
  level: Level;
  /** 封面配色索引，取 design tokens 里的色板 */
  tone: 'sky' | 'mint' | 'peach' | 'lilac' | 'sand';
  /** 是否解锁；未解锁显示灰封面 + 锁 */
  unlocked: boolean;
  /** 读完的页数，用于书架进度条 */
  readPages: number;
  /**
   * 封面插图 slug。不写则用第一页的图。
   * 之所以要单独指定：第一页的图未必能代表整本书
   * （例如「颜色」书的首页是一朵花，做封面看不出主题）。
   */
  cover?: string;
  pages: ReadingPage[];
};

export const toneClass: Record<ReadingBook['tone'], string> = {
  sky: 'toneSky',
  mint: 'toneMint',
  peach: 'tonePeach',
  lilac: 'toneLilac',
  sand: 'toneSand',
};

const p = (img: string, imgAlt: string, en: string, zh: string, focus?: string[]): ReadingPage => ({
  img,
  imgAlt,
  sentence: { en, zh, focus },
});

/** 书架数据。全部为原创短句，不涉及第三方版权内容。 */
export const mockReadings: ReadingBook[] = [
  {
    id: 'colors-around-me',
    titleEn: 'Colors Around Me',
    titleZh: '我身边的颜色',
    stage: 1,
    level: 'kids-a',
    tone: 'sky',
    unlocked: true,
    readPages: 0,
    cover: 'flower',
    pages: [
      p('flower', '一朵粉红色的花', 'This flower is pink.', '这朵花是粉红色的。', ['flower', 'pink']),
      p('blue', '一只蓝色的蝴蝶', 'This butterfly is blue.', '这只蝴蝶是蓝色的。', ['butterfly', 'blue']),
      p('grass', '绿色的草地', 'The grass is green.', '草地是绿色的。', ['grass', 'green']),
      p('sun', '一轮黄色的太阳', 'The sun is yellow.', '太阳是黄色的。', ['sun', 'yellow']),
    ],
  },
  {
    id: 'my-cat-and-dog',
    titleEn: 'My Cat and Dog',
    titleZh: '我的猫和狗',
    stage: 1,
    level: 'kids-a',
    tone: 'peach',
    unlocked: true,
    readPages: 2,
    cover: 'cat',
    pages: [
      p('cat', '一只橘色的小猫', 'This is my cat.', '这是我的猫。', ['cat']),
      p('dog', '一只棕色的小狗', 'That is my dog.', '那是我的狗。', ['dog']),
      p('fish', '一条橙色的鱼', 'My cat likes the fish.', '我的猫喜欢这条鱼。', ['cat', 'fish']),
      p('milk', '一杯牛奶', 'My dog likes the milk.', '我的狗喜欢牛奶。', ['dog', 'milk']),
    ],
  },
  {
    id: 'count-with-me',
    titleEn: 'Count With Me',
    titleZh: '一起数一数',
    stage: 2,
    level: 'kids-a',
    tone: 'mint',
    unlocked: true,
    readPages: 3,
    cover: 'star',
    pages: [
      p('one', '一颗星星', 'I can see one star.', '我能看到一颗星星。', ['one', 'star']),
      p('two', '两个苹果', 'I can see two apples.', '我能看到两个苹果。', ['two', 'apple']),
      p('three', '三只小鸟', 'I can see three birds.', '我能看到三只小鸟。', ['three', 'bird']),
      p('five', '五朵花', 'Now I see five flowers.', '现在我看到了五朵花。', ['five', 'flower']),
    ],
  },
  {
    id: 'my-family',
    titleEn: 'My Family',
    titleZh: '我的家人',
    stage: 2,
    level: 'kids-b',
    tone: 'lilac',
    unlocked: true,
    readPages: 0,
    cover: 'family',
    pages: [
      p('mom', '妈妈在微笑', 'This is my mom. She is kind.', '这是我妈妈。她很温柔。', ['mom', 'kind']),
      p('dad', '爸爸在微笑', 'This is my dad. He is tall.', '这是我爸爸。他很高。', ['dad', 'tall']),
      p('baby', '宝宝在爬', 'This is my baby brother.', '这是我的小弟弟。', ['baby', 'brother']),
      p('family', '一家人站在一起', 'We are a happy family.', '我们是快乐的一家人。', ['happy', 'family']),
    ],
  },
  {
    id: 'the-cat-and-the-bug',
    titleEn: 'The Cat and the Bug',
    titleZh: '小猫和虫子',
    stage: 2,
    level: 'kids-b',
    tone: 'sand',
    unlocked: true,
    readPages: 1,
    cover: 'bee',
    pages: [
      p('cat', '一只坐着的小猫', 'A cat sits in the sun.', '一只猫坐在太阳下。', ['cat', 'sits', 'sun']),
      p('bee', '一只飞行的蜜蜂', 'A bee flies to the flower.', '一只蜜蜂飞向花朵。', ['bee', 'flower']),
      p('ant', '一只小小的蚂蚁', 'The cat looks at the ant.', '猫看着这只蚂蚁。', ['cat', 'ant']),
      p('mouse', '一只灰色的老鼠', 'Then a mouse runs away!', '然后一只老鼠跑走了！', ['mouse', 'runs']),
    ],
  },
  {
    id: 'a-day-at-home',
    titleEn: 'A Day at Home',
    titleZh: '在家的一天',
    stage: 3,
    level: 'kids-b',
    tone: 'sky',
    unlocked: false,
    readPages: 0,
    cover: 'bed',
    pages: [
      p('bed', '一张床', 'I wake up and get out of bed.', '我醒来，下了床。', ['wake', 'bed']),
      p('spoon', '一把勺子', 'I eat my rice with a spoon.', '我用勺子吃饭。', ['eat', 'rice', 'spoon']),
      p('book', '一本合上的书', 'After lunch, I read a book.', '午饭后，我读了一本书。', ['lunch', 'read', 'book']),
      p('moon', '夜晚的月亮', 'When the moon comes up, I sleep.', '月亮升起时，我就睡了。', ['moon', 'sleep']),
    ],
  },
  {
    id: 'weather-today',
    titleEn: 'Weather Today',
    titleZh: '今天的天气',
    stage: 3,
    level: 'kids-b',
    tone: 'mint',
    unlocked: false,
    readPages: 0,
    cover: 'cloud',
    pages: [
      p('sun', '明亮的太阳', 'The sun is out and the sky is clear.', '太阳出来了，天空很晴朗。', ['sun', 'sky']),
      p('cloud', '一朵白云', 'Then a white cloud comes over.', '然后一朵白云飘了过来。', ['white', 'cloud']),
      p('rain', '雨从云里落下', 'Now the rain falls on the trees.', '现在雨落在树上了。', ['rain', 'trees']),
      p('sun', '雨后太阳出来', 'After the rain, the sun comes back.', '雨停后，太阳又出来了。', ['rain', 'sun']),
    ],
  },
];

