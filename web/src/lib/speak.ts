'use client';

/**
 * 统一的发音模块。
 *
 * 之前 5 个文件各写了一份 speak()，改一次要改 5 处。这里收口成一个入口。
 *
 * 音源策略（按优先级自动降级）：
 *   1. 本地音频文件  /audio/{slug}.mp3      —— 最稳，离线可用
 *   2. 在线 TTS 接口 /api/tts?text=xxx      —— 服务端代理百度/有道，有缓存
 *   3. 浏览器合成    speechSynthesis        —— 兜底，无需网络
 *
 * 为什么走 /api/tts 而不是前端直连百度：
 * 百度和有道的接口有 Referer 校验、可能限 IP，前端直连会被浏览器 CORS 拦掉。
 * 由 Next.js 的 Route Handler 代理，既能加正确的请求头，也能做服务端缓存。
 */

export type SpeakState = 'idle' | 'loading' | 'playing';

export type SpeakOptions = {
  /** 播报文本，通常是英文单词或句子 */
  text: string;
  /** 语速，默认 0.85（比正常略慢，适合孩子跟读） */
  rate?: number;
  /** 音源偏好；不传则按上面的优先级自动挑 */
  prefer?: 'local' | 'remote' | 'browser';
  /** 状态回调，用于 UI 显示喇叭动画 */
  onStateChange?: (state: SpeakState) => void;
};

/** 把文本规整成文件名，与 card-images.ts 的规则保持一致 */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/** 当前正在播放的音频元素，用于打断上一次播放 */
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

/** 停掉一切正在播的声音 */
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

/** 用浏览器内置合成兜底 */
function speakWithBrowser(text: string, rate: number, onChange?: (s: SpeakState) => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onChange?.('idle');
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate;
    utter.onstart = () => onChange?.('playing');
    utter.onend = () => onChange?.('idle');
    utter.onerror = () => onChange?.('idle');
    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  } catch {
    onChange?.('idle');
  }
}

/** 播一个音频 URL，失败则 reject */
function playUrl(url: string, onChange?: (s: SpeakState) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    let settled = false;

    const fail = () => {
      if (settled) return;
      settled = true;
      onChange?.('idle');
      reject(new Error('audio failed'));
    };

    audio.onplay = () => onChange?.('playing');
    audio.onended = () => {
      if (settled) return;
      settled = true;
      onChange?.('idle');
      resolve();
    };
    audio.onerror = fail;

    audio.play().catch(fail);
  });
}

/**
 * 探测某个 URL 是否是可用的音频。
 * 用 HEAD 请求，避免下载整个文件。
 */
async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return false;
    const type = res.headers.get('content-type') ?? '';
    return type.startsWith('audio/');
  } catch {
    return false;
  }
}

/**
 * 已知存在的本地音频清单。
 *
 * 为什么需要：直接用 HEAD 探测 /audio/xxx.mp3 会先产生一次 404，
 * 每次发音都多一个请求、控制台还会刷错误。
 * 这里维护一份清单，只有清单里有的才去试本地文件。
 *
 * 生成音频后，把词加进这个数组即可（scripts/gen-audio.mjs 会自动更新它）。
 */
const LOCAL_AUDIO: string[] = [
  'ant',
  'apple',
  'baby',
  'bear',
  'bee',
  'bird',
  'black',
  'blue',
  'brown',
  'car',
  'cat',
  'chair',
  'cow',
  'dad',
  'dog',
  'duck',
  'eight',
  'elephant',
  'fish',
  'five',
  'four',
  'frog',
  'goat',
  'green',
  'hello',
  'hen',
  'horse',
  'lion',
  'mom',
  'monkey',
  'mouse',
  'nine',
  'one',
  'orange',
  'panda',
  'pencil',
  'pig',
  'pink',
  'purple',
  'rabbit',
  'red',
  'seven',
  'sheep',
  'six',
  'snake',
  'table',
  'ten',
  'three',
  'tiger',
  'two',
  'white',
  'yellow',
];

function hasLocalAudio(slug: string): boolean {
  return LOCAL_AUDIO.includes(slug);
}

/**
 * 发音入口。
 * 会依次尝试本地音频 -> 在线接口 -> 浏览器合成，任一成功即停。
 */
export async function speak({
  text,
  rate = 0.85,
  prefer,
  onStateChange,
}: SpeakOptions): Promise<void> {
  if (!text) return;
  stopSpeaking();
  onStateChange?.('loading');

  const slug = toSlug(text);

  // 1. 本地音频（只在清单里有的才试，避免无谓 404）
  if (prefer !== 'remote' && prefer !== 'browser' && slug && hasLocalAudio(slug)) {
    try {
      await playUrl(`/audio/${slug}.mp3`, onStateChange);
      return;
    } catch {
      // 本地播放失败，继续往下试
    }
  }

  // 2. 在线 TTS 接口（服务端代理百度/有道）
  if (prefer !== 'browser') {
    try {
      await playUrl(`/api/tts?text=${encodeURIComponent(text)}&rate=${rate}`, onStateChange);
      return;
    } catch {
      // 在线接口失败，降级到浏览器合成
    }
  }

  // 3. 浏览器合成兜底
  speakWithBrowser(text, rate, onStateChange);
}

/**
 * 预加载一批词的音频，减少点按时等待。
 * 失败静默忽略，不阻塞界面。
 */
export function preloadAudio(texts: string[]) {
  if (typeof window === 'undefined') return;
  for (const t of texts) {
    const slug = toSlug(t);
    if (!slug) continue;
    const audio = new Audio(`/audio/${slug}.mp3`);
    audio.preload = 'auto';
    // 触发加载即可，不用等
    audio.load();
  }
}
