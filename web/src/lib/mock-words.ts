import type { Level } from '@/design/tokens';

/** 一张词卡 */
export type WordCard = {
  word: string;
  /** 美式音标，简化写法 */
  phonetic: string;
  meaningZh: string;
  /** 所属单元，用于分组 */
  unitZh: string;
  /** 是否已收集；未收集的显示为待解锁 */
  collected: boolean;
  level: Level;
};

/**
 * 词卡数据：来自词库（gen-wordbank.mjs 的 WORD_BANK）。
 *
 * 本文件由 scripts/gen-mock-words.mjs 生成，不要手改：
 * 补完图卡后重跑 `node scripts/gen-mock-words.mjs` 即可同步。
 */
export const mockWords: WordCard[] = [
  // 问候
  { word: 'hello', phonetic: '/həˈloʊ/', meaningZh: '你好', unitZh: '问候', collected: true, level: 'kids-a' },
  { word: 'bye', phonetic: '/baɪ/', meaningZh: '再见', unitZh: '问候', collected: true, level: 'kids-a' },
  { word: 'thanks', phonetic: '/θæŋks/', meaningZh: '谢谢', unitZh: '问候', collected: true, level: 'kids-a' },
  { word: 'please', phonetic: '/pliːz/', meaningZh: '请', unitZh: '问候', collected: true, level: 'kids-a' },

  // 颜色
  { word: 'red', phonetic: '/red/', meaningZh: '红色', unitZh: '颜色', collected: true, level: 'kids-a' },
  { word: 'blue', phonetic: '/bluː/', meaningZh: '蓝色', unitZh: '颜色', collected: true, level: 'kids-a' },
  { word: 'green', phonetic: '/ɡriːn/', meaningZh: '绿色', unitZh: '颜色', collected: true, level: 'kids-a' },
  { word: 'yellow', phonetic: '/ˈjeloʊ/', meaningZh: '黄色', unitZh: '颜色', collected: true, level: 'kids-a' },
  { word: 'black', phonetic: '/blæk/', meaningZh: '黑色', unitZh: '颜色', collected: false, level: 'kids-a' },
  { word: 'white', phonetic: '/waɪt/', meaningZh: '白色', unitZh: '颜色', collected: false, level: 'kids-a' },
  { word: 'pink', phonetic: '/pɪŋk/', meaningZh: '粉色', unitZh: '颜色', collected: false, level: 'kids-a' },
  { word: 'orange', phonetic: '/ˈɔːrɪndʒ/', meaningZh: '橙色', unitZh: '颜色', collected: false, level: 'kids-a' },
  { word: 'purple', phonetic: '/ˈpɜːrpəl/', meaningZh: '紫色', unitZh: '颜色', collected: false, level: 'kids-a' },
  { word: 'brown', phonetic: '/braʊn/', meaningZh: '棕色', unitZh: '颜色', collected: false, level: 'kids-a' },

  // 动物
  { word: 'cat', phonetic: '/kæt/', meaningZh: '猫', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'dog', phonetic: '/dɔːɡ/', meaningZh: '狗', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'bird', phonetic: '/bɜːrd/', meaningZh: '鸟', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'fish', phonetic: '/fɪʃ/', meaningZh: '鱼', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'duck', phonetic: '/dʌk/', meaningZh: '鸭子', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'horse', phonetic: '/hɔːrs/', meaningZh: '马', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'rabbit', phonetic: '/ˈræbɪt/', meaningZh: '兔子', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'panda', phonetic: '/ˈpændə/', meaningZh: '熊猫', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'lion', phonetic: '/ˈlaɪən/', meaningZh: '狮子', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'tiger', phonetic: '/ˈtaɪɡər/', meaningZh: '老虎', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'monkey', phonetic: '/ˈmʌŋki/', meaningZh: '猴子', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'elephant', phonetic: '/ˈelɪfənt/', meaningZh: '大象', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'bear', phonetic: '/ber/', meaningZh: '熊', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'frog', phonetic: '/frɔːɡ/', meaningZh: '青蛙', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'bee', phonetic: '/biː/', meaningZh: '蜜蜂', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'ant', phonetic: '/ænt/', meaningZh: '蚂蚁', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'hen', phonetic: '/hen/', meaningZh: '母鸡', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'goat', phonetic: '/ɡoʊt/', meaningZh: '山羊', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'mouse', phonetic: '/maʊs/', meaningZh: '老鼠', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'snake', phonetic: '/sneɪk/', meaningZh: '蛇', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'cow', phonetic: '/kaʊ/', meaningZh: '奶牛', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'pig', phonetic: '/pɪɡ/', meaningZh: '猪', unitZh: '动物', collected: false, level: 'kids-a' },
  { word: 'sheep', phonetic: '/ʃiːp/', meaningZh: '绵羊', unitZh: '动物', collected: false, level: 'kids-a' },

  // 数字
  { word: 'one', phonetic: '/wʌn/', meaningZh: '一', unitZh: '数字', collected: true, level: 'kids-a' },
  { word: 'two', phonetic: '/tuː/', meaningZh: '二', unitZh: '数字', collected: true, level: 'kids-a' },
  { word: 'three', phonetic: '/θriː/', meaningZh: '三', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'four', phonetic: '/fɔːr/', meaningZh: '四', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'five', phonetic: '/faɪv/', meaningZh: '五', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'six', phonetic: '/sɪks/', meaningZh: '六', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'seven', phonetic: '/ˈsevən/', meaningZh: '七', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'eight', phonetic: '/eɪt/', meaningZh: '八', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'nine', phonetic: '/naɪn/', meaningZh: '九', unitZh: '数字', collected: false, level: 'kids-a' },
  { word: 'ten', phonetic: '/ten/', meaningZh: '十', unitZh: '数字', collected: false, level: 'kids-a' },

  // 我的家
  { word: 'mom', phonetic: '/mɑːm/', meaningZh: '妈妈', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'dad', phonetic: '/dæd/', meaningZh: '爸爸', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'baby', phonetic: '/ˈbeɪbi/', meaningZh: '宝宝', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'sister', phonetic: '/ˈsɪstər/', meaningZh: '姐姐／妹妹', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'brother', phonetic: '/ˈbrʌðər/', meaningZh: '哥哥／弟弟', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'grandma', phonetic: '/ˈɡrænmɑː/', meaningZh: '奶奶／外婆', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'grandpa', phonetic: '/ˈɡrænpɑː/', meaningZh: '爷爷／外公', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'family', phonetic: '/ˈfæməli/', meaningZh: '家人', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'table', phonetic: '/ˈteɪbəl/', meaningZh: '桌子', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'chair', phonetic: '/tʃer/', meaningZh: '椅子', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'door', phonetic: '/dɔːr/', meaningZh: '门', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'window', phonetic: '/ˈwɪndoʊ/', meaningZh: '窗户', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'bed', phonetic: '/bed/', meaningZh: '床', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'clock', phonetic: '/klɑːk/', meaningZh: '钟表', unitZh: '我的家', collected: false, level: 'kids-a' },
  { word: 'key', phonetic: '/kiː/', meaningZh: '钥匙', unitZh: '我的家', collected: false, level: 'kids-a' },

  // 食物
  { word: 'apple', phonetic: '/ˈæpəl/', meaningZh: '苹果', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'banana', phonetic: '/bəˈnænə/', meaningZh: '香蕉', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'orange-fruit', phonetic: '/ˈɔːrɪndʒ/', meaningZh: '橙子', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'bread', phonetic: '/bred/', meaningZh: '面包', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'milk', phonetic: '/mɪlk/', meaningZh: '牛奶', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'egg', phonetic: '/eɡ/', meaningZh: '鸡蛋', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'rice', phonetic: '/raɪs/', meaningZh: '米饭', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'cake', phonetic: '/keɪk/', meaningZh: '蛋糕', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'water', phonetic: '/ˈwɔːtər/', meaningZh: '水', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'juice', phonetic: '/dʒuːs/', meaningZh: '果汁', unitZh: '食物', collected: false, level: 'kids-a' },
  { word: 'noodles', phonetic: '/ˈnuːdəlz/', meaningZh: '面条', unitZh: '食物', collected: false, level: 'kids-a' },

  // 身体
  { word: 'hand', phonetic: '/hænd/', meaningZh: '手', unitZh: '身体', collected: false, level: 'kids-a' },
  { word: 'foot', phonetic: '/fʊt/', meaningZh: '脚', unitZh: '身体', collected: false, level: 'kids-a' },
  { word: 'eye', phonetic: '/aɪ/', meaningZh: '眼睛', unitZh: '身体', collected: false, level: 'kids-a' },
  { word: 'ear', phonetic: '/ɪr/', meaningZh: '耳朵', unitZh: '身体', collected: false, level: 'kids-a' },
  { word: 'nose', phonetic: '/noʊz/', meaningZh: '鼻子', unitZh: '身体', collected: false, level: 'kids-a' },
  { word: 'mouth', phonetic: '/maʊθ/', meaningZh: '嘴巴', unitZh: '身体', collected: false, level: 'kids-a' },
  { word: 'head', phonetic: '/hed/', meaningZh: '头', unitZh: '身体', collected: false, level: 'kids-a' },
  { word: 'hair', phonetic: '/her/', meaningZh: '头发', unitZh: '身体', collected: false, level: 'kids-a' },

  // 日常用品
  { word: 'book', phonetic: '/bʊk/', meaningZh: '书', unitZh: '日常用品', collected: false, level: 'kids-a' },
  { word: 'bag', phonetic: '/bæɡ/', meaningZh: '书包', unitZh: '日常用品', collected: false, level: 'kids-a' },
  { word: 'cup', phonetic: '/kʌp/', meaningZh: '杯子', unitZh: '日常用品', collected: false, level: 'kids-a' },
  { word: 'spoon', phonetic: '/spuːn/', meaningZh: '勺子', unitZh: '日常用品', collected: false, level: 'kids-a' },
  { word: 'ball', phonetic: '/bɔːl/', meaningZh: '球', unitZh: '日常用品', collected: false, level: 'kids-a' },
  { word: 'pencil', phonetic: '/ˈpensəl/', meaningZh: '铅笔', unitZh: '日常用品', collected: false, level: 'kids-a' },
  { word: 'car', phonetic: '/kɑːr/', meaningZh: '小汽车', unitZh: '日常用品', collected: false, level: 'kids-a' },

  // 交通工具
  { word: 'bus', phonetic: '/bʌs/', meaningZh: '公交车', unitZh: '交通工具', collected: false, level: 'kids-a' },
  { word: 'bike', phonetic: '/baɪk/', meaningZh: '自行车', unitZh: '交通工具', collected: false, level: 'kids-a' },
  { word: 'train', phonetic: '/treɪn/', meaningZh: '火车', unitZh: '交通工具', collected: false, level: 'kids-a' },
  { word: 'plane', phonetic: '/pleɪn/', meaningZh: '飞机', unitZh: '交通工具', collected: false, level: 'kids-a' },
  { word: 'boat', phonetic: '/boʊt/', meaningZh: '船', unitZh: '交通工具', collected: false, level: 'kids-a' },
  { word: 'truck', phonetic: '/trʌk/', meaningZh: '卡车', unitZh: '交通工具', collected: false, level: 'kids-a' },

  // 天气与自然
  { word: 'sun', phonetic: '/sʌn/', meaningZh: '太阳', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'moon', phonetic: '/muːn/', meaningZh: '月亮', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'star', phonetic: '/stɑːr/', meaningZh: '星星', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'rain', phonetic: '/reɪn/', meaningZh: '雨', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'snow', phonetic: '/snoʊ/', meaningZh: '雪', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'cloud', phonetic: '/klaʊd/', meaningZh: '云', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'tree', phonetic: '/triː/', meaningZh: '树', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'flower', phonetic: '/ˈflaʊər/', meaningZh: '花', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'grass', phonetic: '/ɡræs/', meaningZh: '草', unitZh: '天气与自然', collected: false, level: 'kids-a' },
  { word: 'wind', phonetic: '/wɪnd/', meaningZh: '风', unitZh: '天气与自然', collected: false, level: 'kids-a' },

  // 动作
  { word: 'run', phonetic: '/rʌn/', meaningZh: '跑', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'jump', phonetic: '/dʒʌmp/', meaningZh: '跳', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'sit', phonetic: '/sɪt/', meaningZh: '坐', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'eat', phonetic: '/iːt/', meaningZh: '吃', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'drink', phonetic: '/drɪŋk/', meaningZh: '喝', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'sleep', phonetic: '/sliːp/', meaningZh: '睡觉', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'walk', phonetic: '/wɔːk/', meaningZh: '走', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'read', phonetic: '/riːd/', meaningZh: '阅读', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'write', phonetic: '/raɪt/', meaningZh: '写', unitZh: '动作', collected: false, level: 'kids-a' },
  { word: 'sing', phonetic: '/sɪŋ/', meaningZh: '唱歌', unitZh: '动作', collected: false, level: 'kids-a' },
];

/** 空词包状态：全新学习者还没通关任何单元 */
export const emptyWords: WordCard[] = [];
