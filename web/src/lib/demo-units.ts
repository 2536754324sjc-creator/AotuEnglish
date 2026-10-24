import type { Unit } from './types';

/**
 * 新题型的演示单元。
 *
 * 为什么单独一份而不是塞进 mock-data：
 * - 这三种题型需要后端按档位下发不同结构的数据，真实的 OU 工作流还产不出
 *   （见 docs/frontend-plan.md §5.1.1：repeat_word / blend_sounds / business_scenario
 *   要等前端组件做好后再进工作流）
 * - 单独放一份，方便直接访问 `/learn/unit/demo-blend` 验证，
 *   临时数据也容易整体删除
 *
 * 数据形状说明见各题型的组件注释。
 */

/** 拼读演示：c-a-t → cat */
const blendUnit: Unit = {
  unitId: 'demo-blend',
  index: 1,
  level: 'kids-a',
  topic: 'Phonics Practice',
  titleZh: '拼读练习',
  wordCount: 3,
  estMinutes: 3,
  status: 'current',
  questions: [
    {
      id: 'demo-blend-q1',
      type: 'blend_sounds',
      promptZh: '把声音拼起来，看看是什么词',
      audioText: 'cat',
      options: [
        { id: 'c', text: 'c', correct: true },
        { id: 'a', text: 'a', correct: false },
        { id: 't', text: 't', correct: false },
        { id: 'x', text: 's', correct: false },
      ],
    },
    {
      id: 'demo-blend-q2',
      type: 'blend_sounds',
      promptZh: '再来一个，这次长一点',
      audioText: 'fish',
      options: [
        { id: 'f', text: 'f', correct: true },
        { id: 'i', text: 'i', correct: false },
        { id: 's', text: 's', correct: false },
        { id: 'h', text: 'h', correct: false },
      ],
    },
  ],
};

/** 跟读演示：单词跟读 */
const repeatUnit: Unit = {
  unitId: 'demo-repeat',
  index: 1,
  level: 'kids-a',
  topic: 'Speaking Practice',
  titleZh: '跟读练习',
  wordCount: 2,
  estMinutes: 2,
  status: 'current',
  questions: [
    {
      id: 'demo-repeat-q1',
      type: 'repeat_word',
      promptZh: '听一听，然后跟着读',
      audioText: 'hello',
      options: [{ id: 'r1', text: 'Hello', correct: true }],
    },
    {
      id: 'demo-repeat-q2',
      type: 'repeat_word',
      promptZh: '这次读一个长一点的',
      audioText: 'elephant',
      options: [{ id: 'r2', text: 'Elephant', correct: true }],
    },
  ],
};

/** 商务场景演示：成人档 */
const businessUnit: Unit = {
  unitId: 'demo-business',
  index: 1,
  level: 'adult',
  topic: 'Business Email',
  titleZh: '商务邮件',
  wordCount: 3,
  estMinutes: 4,
  status: 'current',
  questions: [
    {
      id: 'demo-biz-q1',
      type: 'business_scenario',
      promptZh: '客户问你能不能提前交付',
      audioText:
        'Client: Hi, would it be possible to deliver the report by Friday instead of next Monday?|You: Let me check with the team and get back to you.',
      options: [
        {
          id: 'a',
          text: "Sure, we'll get it to you by Friday and confirm tomorrow.",
          correct: true,
        },
        { id: 'b', text: 'No. The deadline is next Monday.', correct: false },
        { id: 'c', text: 'I dunno, maybe.', correct: false },
      ],
    },
    {
      id: 'demo-biz-q2',
      type: 'business_scenario',
      promptZh: '对方道歉说回复晚了',
      audioText:
        'Partner: Sorry for the late reply, things have been busy here.|You: No worries, thanks for getting back to me.',
      options: [
        { id: 'a', text: "It's fine — thank you for following up.", correct: true },
        { id: 'b', text: 'Why were you so slow?', correct: false },
        { id: 'c', text: "That's unacceptable.", correct: false },
      ],
    },
    {
      id: 'demo-biz-q3',
      type: 'business_scenario',
      promptZh: '你想把会议往后推一周',
      audioText:
        'Colleague: Shall we keep the review meeting on Tuesday?|You: I need a bit more time to finish the deck.',
      options: [
        {
          id: 'a',
          text: 'Would it work to move it to next Tuesday? I need a few more days on the deck.',
          correct: true,
        },
        { id: 'b', text: 'Cancel the meeting.', correct: false },
        { id: 'c', text: 'I cannot attend, sorry.', correct: false },
      ],
    },
  ],
};

/** 全部演示单元：可直接通过 /learn/unit/{unitId} 访问 */
export const demoUnits: Unit[] = [blendUnit, repeatUnit, businessUnit];
