import type { Course, ReportRow, TodayProgress, Unit, WeeklyReport } from './types';
import { getToken } from './auth';
import { applyDoneUnits, getDoneUnits, markUnitDone, getReadingProgress } from './progress-store';
import { mockCourses, mockReportRows, mockTodayProgress, mockWeeklyReport } from './mock-data';
import { sampleUnits } from './mock-data';
import { demoUnits } from './demo-units';
import { mockWords } from './mock-words';
import type { WordCard } from './mock-words';
import { mockReadings } from './mock-readings';
import type { ReadingBook } from './mock-readings';
import { mockReviewItems } from './mock-review';
import type { ReviewItem } from './mock-review';
import { mockBadges, mockChest, mockShop } from './mock-rewards';
import type { Badge, ChestState, ShopItem } from './mock-rewards';
import type {
  AccountOverview,
  Learner,
  StudyPlan,
  StudyPreferences,
} from './parent-types';

/**
 * 数据访问层 —— 页面从这里取数据，不再直接 import mock 文件。
 *
 * 为什么要有这一层：
 * - `docs/api-contract.md` 定义了接口形状，但没有代码能证明「契约 = mock = 页面所需」
 * - 有了本层，mock 与真实接口返回**同一个类型**，切模式时编译期就能发现不一致
 * - 后端未就绪时 `mock` 模式照常开发、演示、跑 E2E，不受网络影响
 *
 * 切换方式（二选一）：
 *   NEXT_PUBLIC_API_MODE=live  + NEXT_PUBLIC_API_BASE=https://api.example.com
 *   或代码里显式调用 setApiMode('live')
 *
 * 注意：本文件同时被服务端组件引用，**不能 import React**。
 * 异步取数的 hook 在 `use-api.ts`。
 */

export type ApiMode = 'mock' | 'live';

const MODE: ApiMode =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_MODE === 'live' ? 'live' : 'mock';

const BASE = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) || '/api';

/* ---------------- 通用请求 ---------------- */

/** 契约 §1.1 的错误格式 */
export type ApiErrorBody = {
  error: { code: string; message: string; requestId?: string };
};

export class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;

  constructor(status: number, body: Partial<ApiErrorBody>) {
    const e = body?.error;
    super(e?.message ?? `请求失败（${status}）`);
    this.name = 'ApiError';
    this.status = status;
    this.code = e?.code ?? 'INTERNAL';
    this.requestId = e?.requestId;
  }

  /** 参数类错误：调用方写错了，重试没用 */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // token 只在浏览器里有；SSR 阶段不带头，避免把 undefined 发出去。
  // 存储键必须与 `lib/auth.ts` 的 TOKEN_KEY 保持一致 —— 早期这里写的是 'token'，
  // 而 auth.ts 写 'aotu.token'，导致登录后请求从不带 token（后端一接就暴露）。
  const token = typeof window !== 'undefined' ? getToken() : null;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    // 网络断开：统一成 ApiError，调用方不用区分 fetch 异常
    throw new ApiError(0, { error: { code: 'NETWORK', message: '网络连接失败，请稍后重试' } });
  }

  if (!res.ok) {
    let body: Partial<ApiErrorBody> = {};
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // 非 JSON 错误体（网关 502 之类），保留状态码即可
    }
    throw new ApiError(res.status, body);
  }

  return (await res.json()) as T;
}

/* ---------------- 返回类型（契约 §3 / §4） ---------------- */

export type ProgressResponse = TodayProgress;
export type UnitResponse = { unit: Unit };
export type CoursesResponse = { items: Course[]; total: number; page: number; pageSize: number };
export type WordsResponse = { items: WordCard[]; total: number; collectedCount: number };
export type ReadingsResponse = { items: ReadingBook[]; total: number };
export type ReviewResponse = { items: ReviewItem[]; total: number };
export type RewardsResponse = { badges: Badge[]; chest: ChestState; shop: ShopItem[] };
export type WeeklyReportResponse = { report: WeeklyReport; rows: ReportRow[] };

/** 作答批次上报（契约 §4.6） */
export type SessionAnswer = {
  questionId: string;
  correct: boolean;
  /** 试了几次才答对 —— 周报「薄弱项」靠它算，必须传 */
  attempts: number;
  elapsedMs: number;
};

export type SessionRequest = {
  unitId: string;
  startedAt: string;
  finishedAt: string;
  answers: SessionAnswer[];
};

export type SessionResult = {
  sessionId: string;
  stars: 1 | 2 | 3;
  starTotal: number;
  chestRemaining: number;
  unitStatus: 'done' | 'current' | 'locked';
  nextUnitId: string | null;
};

/* ---------------- 认证（契约 §4.1） ---------------- */

export type LoginRequest = {
  email: string;
  password: string;
  mode: 'login' | 'signup';
};

export type AuthUser = {
  id: string;
  name: string;
  level: 'kids-a' | 'kids-b' | 'teen' | 'adult';
  role: 'learner' | 'parent';
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

/* ---------------- mock 实现 ---------------- */

/**
 * mock 模式下的作答结果。
 * 星星算法：全对 3 星，错 1 题 2 星，其余 1 星 —— 与结算页的展示逻辑一致。
 */
function mockSession(req: SessionRequest): SessionResult {
  const wrong = req.answers.filter((a) => !a.correct).length;
  const stars: 1 | 2 | 3 = wrong === 0 ? 3 : wrong === 1 ? 2 : 1;

  const idx = mockTodayProgress.units.findIndex((u) => u.unitId === req.unitId);
  const nextUnit = idx >= 0 ? mockTodayProgress.units[idx + 1] : undefined;

  return {
    sessionId: `mock-${Date.now()}`,
    stars,
    starTotal: mockTodayProgress.starTotal + stars,
    chestRemaining: Math.max(0, mockTodayProgress.chestRemaining - 1),
    unitStatus: 'done',
    nextUnitId: nextUnit?.unitId ?? null,
  };
}

/* ---------------- 词卡与读物的进度推导 ---------------- */

/**
 * 已完成单元对应的中文单元名（词卡的 unitZh 用的是中文名）。
 *
 * 来源是地图单元本身（unitId -> titleZh），不另建一份映射表 ——
 * 否则改了单元标题，词卡分组会悄悄对不上。
 */
function doneUnitTitles(): Set<string> {
  const done = new Set(getDoneUnits());
  const titles = new Set<string>();
  for (const u of [...mockTodayProgress.units, ...sampleUnits, ...demoUnits]) {
    if (done.has(u.unitId)) titles.add(u.titleZh);
  }
  return titles;
}

const mockApi = {
  // 地图进度 = 静态基线 + 本地完成记录，这样答完一关地图真的会前进
  getProgress: async () => applyDoneUnits(mockTodayProgress, getDoneUnits()),

  /* ---------- 家长端设置（本地持久化） ---------- */

  getPlan: async (): Promise<StudyPlan> => readLocal('plan', DEFAULT_PLAN),
  savePlan: async (p: StudyPlan): Promise<StudyPlan> => writeLocal('plan', p),

  getLearners: async (): Promise<Learner[]> => readLocal('learners', DEFAULT_LEARNERS),
  saveLearners: async (list: Learner[]): Promise<Learner[]> => writeLocal('learners', list),

  getPreferences: async (): Promise<StudyPreferences> =>
    readLocal('prefs', DEFAULT_PREFERENCES),
  savePreferences: async (p: StudyPreferences): Promise<StudyPreferences> =>
    writeLocal('prefs', p),

  getAccount: async (): Promise<AccountOverview> => readLocal('account', DEFAULT_ACCOUNT),

  getUnit: async (unitId: string): Promise<UnitResponse> => {
    // 查找顺序：地图进度里的单元 → 内容样例 → 新题型演示单元
    const unit =
      mockTodayProgress.units.find((u) => u.unitId === unitId) ??
      sampleUnits.find((u) => u.unitId === unitId) ??
      demoUnits.find((u) => u.unitId === unitId);
    if (!unit) {
      throw new ApiError(404, { error: { code: 'NOT_FOUND', message: '单元不存在' } });
    }
    return { unit };
  },

  getCourses: async (): Promise<CoursesResponse> => ({
    items: mockCourses,
    total: mockCourses.length,
    page: 1,
    pageSize: mockCourses.length,
  }),

  submitSession: async (req: SessionRequest) => {
    // 记下完成状态，让地图 / 词卡 / 练习进度都跟着走
    markUnitDone(req.unitId);
    return mockSession(req);
  },

  /**
   * 词卡：`collected` 由「哪些单元已完成」推导，不再是写死的常量。
   *
   * 之前 gen-mock-words.mjs 里有一个固定的 COLLECTED 集合（只含 10 个词），
   * 与真实进度无关 —— 答完「动物」那一关，动物词仍然锁着，家长会以为白学了。
   * 现在按 unitZh 对照已完成的单元名，答完一关词卡就真的解锁。
   */
  getWords: async (): Promise<WordsResponse> => {
    const doneTitles = doneUnitTitles();
    const items = mockWords.map((w) => ({
      ...w,
      collected: doneTitles.has(w.unitZh),
    }));
    return {
      items,
      total: items.length,
      collectedCount: items.filter((w) => w.collected).length,
    };
  },

  getReadings: async (): Promise<ReadingsResponse> => {
    // 读物进度也读本地记录，读完的页数会保留
    const prog = getReadingProgress();
    const items = mockReadings.map((b) => {
      const read = prog[b.id] ?? b.readPages;
      return { ...b, readPages: Math.min(read, b.pages.length) };
    });
    return { items, total: items.length };
  },

  getReview: async (): Promise<ReviewResponse> => ({
    // dueDays 越大越先复习
    items: [...mockReviewItems].sort((a, b) => b.dueDays - a.dueDays),
    total: mockReviewItems.length,
  }),

  getRewards: async (): Promise<RewardsResponse> => ({
    badges: mockBadges,
    chest: mockChest,
    shop: mockShop,
  }),

  getWeeklyReport: async (): Promise<WeeklyReportResponse> => ({
    report: mockWeeklyReport,
    rows: mockReportRows,
  }),

  /**
   * mock 登录。
   *
   * 刻意保留几条真实后端会遇到的分支，好让前端的错误处理有东西可测：
   * - taken@example.com  → 注册时邮箱已占用（409）
   * - wrong@example.com  → 登录时账号或密码错（401）
   * - 密码少于 8 位       → 参数校验失败（400）
   * 其余邮箱一律成功，方便随手试。
   */
  login: async (req: LoginRequest): Promise<AuthSession> => {
    // 模拟网络延迟，让 loading 态能被看见
    await new Promise((r) => setTimeout(r, 600));

    const email = req.email.trim().toLowerCase();

    if (req.password.length < 8) {
      throw new ApiError(400, {
        error: { code: 'INVALID_PARAM', message: '密码至少 8 位' },
      });
    }

    if (req.mode === 'signup' && email === 'taken@example.com') {
      throw new ApiError(409, {
        error: { code: 'EMAIL_TAKEN', message: '这个邮箱已经注册过了，直接登录吧' },
      });
    }

    if (req.mode === 'login' && email === 'wrong@example.com') {
      throw new ApiError(401, {
        error: { code: 'UNAUTHORIZED', message: '邮箱或密码不对' },
      });
    }

    // 邮箱前缀当名字，方便一眼看出登录的是谁
    const name = email.split('@')[0] || 'Mia';

    return {
      // btoa 只在浏览器有；SSR 阶段不会走到这里，但给个兜底避免崩
      token: `mock.${typeof btoa === 'function' ? btoa(email) : email}.${Date.now()}`,
      // 30 天后过期，与契约示例一致
      expiresAt: new Date(Date.now() + 30 * 864e5).toISOString(),
      user: { id: `u_${name}`, name, level: 'kids-a', role: 'parent' },
    };
  },
};

/* ---------------- 家长端设置的本地存储 ---------------- */

/**
 * 这些设置类数据目前只在浏览器本地保存。
 *
 * 为什么不做成纯内存 mock：设置改了刷新就丢，会被当成 bug。
 * 为什么放在 api.ts 而不是页面里：页面不直接碰存储，切后端时只改这里。
 */
const PARENT_STORE_PREFIX = 'aotu.parent.';

const DEFAULT_PLAN: StudyPlan = {
  level: 'kids-a',
  dailyMinutes: 15,
  dailyStars: 5,
  daysPerWeek: 5,
  remindAt: '',
  restDays: [0, 6],
};

const DEFAULT_LEARNERS: Learner[] = [
  {
    id: 'u_mia',
    name: 'Mia',
    level: 'kids-a',
    avatar: 'M',
    birthYear: null,
    createdAt: '2026-09-01',
    active: true,
  },
];

const DEFAULT_PREFERENCES: StudyPreferences = {
  weeklyReportEmail: true,
  dailyReminder: false,
  quietStart: '21:00',
  quietEnd: '07:00',
  soundEffects: true,
  locale: 'zh',
};

const DEFAULT_ACCOUNT: AccountOverview = {
  email: 'mia@example.com',
  name: 'Mia 的家长',
  planId: 'family',
  planName: '家庭版',
  cycle: 'monthly',
  renewsAt: null,
  invoices: [],
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(PARENT_STORE_PREFIX + key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T extends object>(key: string, value: T): T {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PARENT_STORE_PREFIX + key, JSON.stringify(value));
    } catch {
      // 隐私模式写不进去：仍然把值返回给调用方，界面保持用户刚改的状态
    }
  }
  return value;
}

/* ---------------- 对外 API ---------------- */

export const api = {
  getProgress(): Promise<ProgressResponse> {
    return MODE === 'mock' ? mockApi.getProgress() : request<ProgressResponse>('/users/me/progress');
  },

  getUnit(unitId: string): Promise<UnitResponse> {
    return MODE === 'mock'
      ? mockApi.getUnit(unitId)
      : request<UnitResponse>(`/units/${encodeURIComponent(unitId)}`);
  },

  getCourses(): Promise<CoursesResponse> {
    return MODE === 'mock' ? mockApi.getCourses() : request<CoursesResponse>('/courses');
  },

  submitSession(req: SessionRequest): Promise<SessionResult> {
    return MODE === 'mock'
      ? mockApi.submitSession(req)
      : request<SessionResult>('/users/me/sessions', {
          method: 'POST',
          body: JSON.stringify(req),
        });
  },

  getWords(): Promise<WordsResponse> {
    return MODE === 'mock' ? mockApi.getWords() : request<WordsResponse>('/users/me/words');
  },

  getReadings(): Promise<ReadingsResponse> {
    return MODE === 'mock' ? mockApi.getReadings() : request<ReadingsResponse>('/readings');
  },

  getReview(): Promise<ReviewResponse> {
    return MODE === 'mock' ? mockApi.getReview() : request<ReviewResponse>('/users/me/review');
  },

  getRewards(): Promise<RewardsResponse> {
    return MODE === 'mock'
      ? mockApi.getRewards()
      : request<RewardsResponse>('/users/me/rewards');
  },

  getWeeklyReport(week?: string): Promise<WeeklyReportResponse> {
    const q = week ? `?week=${encodeURIComponent(week)}` : '';
    return MODE === 'mock'
      ? mockApi.getWeeklyReport()
      : request<WeeklyReportResponse>(`/reports/weekly${q}`);
  },

  login(req: LoginRequest): Promise<AuthSession> {
    return MODE === 'mock' ? mockApi.login(req) : request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  /* ---------- 家长端设置 ---------- */

  getPlan(): Promise<StudyPlan> {
    return MODE === 'mock' ? mockApi.getPlan() : request<StudyPlan>('/users/me/plan');
  },

  savePlan(p: StudyPlan): Promise<StudyPlan> {
    return MODE === 'mock'
      ? mockApi.savePlan(p)
      : request<StudyPlan>('/users/me/plan', { method: 'PUT', body: JSON.stringify(p) });
  },

  getLearners(): Promise<Learner[]> {
    return MODE === 'mock' ? mockApi.getLearners() : request<Learner[]>('/users/me/learners');
  },

  saveLearners(list: Learner[]): Promise<Learner[]> {
    return MODE === 'mock'
      ? mockApi.saveLearners(list)
      : request<Learner[]>('/users/me/learners', {
          method: 'PUT',
          body: JSON.stringify({ items: list }),
        });
  },

  getPreferences(): Promise<StudyPreferences> {
    return MODE === 'mock'
      ? mockApi.getPreferences()
      : request<StudyPreferences>('/users/me/preferences');
  },

  savePreferences(p: StudyPreferences): Promise<StudyPreferences> {
    return MODE === 'mock'
      ? mockApi.savePreferences(p)
      : request<StudyPreferences>('/users/me/preferences', {
          method: 'PUT',
          body: JSON.stringify(p),
        });
  },

  getAccount(): Promise<AccountOverview> {
    return MODE === 'mock' ? mockApi.getAccount() : request<AccountOverview>('/users/me/account');
  },

  /**
   * 单题判分（服务端判分模式的必需接口）。
   *
   * live 模式下单元不含答案，答题机必须问服务端。
   * mock 模式返回 null 表示「自己判」，由答题机用本地的 correct 字段。
   */
  checkAnswer(unitId: string, questionId: string, optionId: string): Promise<{ correct: boolean } | null> {
    if (MODE === 'mock') return Promise.resolve(null);
    return request<{ correct: boolean }>(`/units/${encodeURIComponent(unitId)}/check`, {
      method: 'POST',
      body: JSON.stringify({ questionId, optionId }),
    });
  },

  /** 当前是否为服务端判分模式 */
  get isServerGrading(): boolean {
    return MODE === 'live';
  },
};

/** 当前模式，调试用 */
export const apiMode: ApiMode = MODE;

/* ---------------- 服务端同步读取 ---------------- */

/**
 * 服务端组件专用：同步读首页需要的营销数据。
 *
 * 为什么首页特殊：它是 SSR 的营销页，首屏地图切片要出现在 HTML 里（SEO + 首屏速度），
 * 如果用 hook 异步取，首屏就是空的。营销页的数据变化不频繁，适合构建期预渲染。
 *
 * 接后端后这里改成在 Server Component 里 `await fetch()`，
 * 并用 `revalidate` 控制缓存周期即可，页面结构不变。
 */
export function getMarketingSnapshot() {
  return { progress: mockTodayProgress, courses: mockCourses };
}

/*
 * 异步取数 hook 在 `use-api.ts`，不要放回本文件。
 * 本文件被服务端组件（首页、/api/contract-check）引用，
 * 一旦 import React hooks，Next 会报 RSC 边界错误。
 */
