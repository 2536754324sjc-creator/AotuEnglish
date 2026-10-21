import type { Question } from './types';

/** 一道待复习的题 */
export type ReviewItem = {
  id: string;
  /** 来自哪个单元 */
  fromUnitZh: string;
  /** 距今天数，越大越该复习 */
  dueDays: number;
  question: Question;
};

/**
 * 到期内容：用已有的单元题目组合，
 * 规则近似「艾宾浩斯」——越久没碰的排在越前面。
 */
export const mockReviewItems: ReviewItem[] = [
  {
    id: 'r1',
    fromUnitZh: '问候',
    dueDays: 6,
    question: {
      id: 'r1-q',
      type: 'listen_choose_image',
      promptZh: '听一听，选出正确的图',
      audioText: 'hello',
      options: [
        { id: 'a', imagePrompt: 'greeting hello flat vector illustration', correct: true },
        { id: 'b', imagePrompt: 'color red flat vector illustration', correct: false },
      ],
    },
  },
  {
    id: 'r2',
    fromUnitZh: '颜色',
    dueDays: 4,
    question: {
      id: 'r2-q',
      type: 'read_choose',
      promptZh: '选出正确的意思',
      audioText: 'yellow',
      options: [
        { id: 'a', text: '黄色', correct: true },
        { id: 'b', text: '绿色', correct: false },
        { id: 'c', text: '蓝色', correct: false },
      ],
    },
  },
  {
    id: 'r3',
    fromUnitZh: '动物',
    dueDays: 3,
    question: {
      id: 'r3-q',
      type: 'tap_to_read',
      promptZh: '点一下听发音',
      audioText: 'bird',
      options: [{ id: 'a', text: 'Bird', correct: true }],
    },
  },
  {
    id: 'r4',
    fromUnitZh: '数字',
    dueDays: 2,
    question: {
      id: 'r4-q',
      type: 'read_choose',
      promptZh: '选出正确的意思',
      audioText: 'three',
      options: [
        { id: 'a', text: '二', correct: false },
        { id: 'b', text: '三', correct: true },
      ],
    },
  },
  {
    id: 'r5',
    fromUnitZh: '问候',
    dueDays: 1,
    question: {
      id: 'r5-q',
      type: 'read_choose',
      promptZh: '选出正确的意思',
      audioText: 'thanks',
      options: [
        { id: 'a', text: '谢谢', correct: true },
        { id: 'b', text: '请', correct: false },
      ],
    },
  },
];

/** 无到期内容的状态 */
export const emptyReview: ReviewItem[] = [];
