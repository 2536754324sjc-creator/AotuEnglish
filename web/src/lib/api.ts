import type { Course, ReportRow, TodayProgress, Unit, WeeklyReport } from './types';
import { mockCourses, mockReportRows, mockTodayProgress, mockWeeklyReport } from './mock-data';
import { sampleUnits } from './mock-data';
import { mockWords } from './mock-words';
import type { WordCard } from './mock-words';
import { mockReadings } from './mock-readings';
import type { ReadingBook } from './mock-readings';
import { mockReviewItems } from './mock-review';
import type { ReviewItem } from './mock-review';
import { mockBadges, mockChest, mockShop } from './mock-rewards';
import type { Badge, ChestState, ShopItem } from './mock-rewards';

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
  // token 只在浏览器里有；SSR 阶段不带头，避免把 undefined 发出去
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

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

const mockApi = {
  getProgress: async () => mockTodayProgress,

  getUnit: async (unitId: string): Promise<UnitResponse> => {
    // 地图进度里的单元 + 内容样例，两者都可直链访问
    const unit =
      mockTodayProgress.units.find((u) => u.unitId === unitId) ??
      sampleUnits.find((u) => u.unitId === unitId);
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

  submitSession: async (req: SessionRequest) => mockSession(req),

  getWords: async (): Promise<WordsResponse> => ({
    items: mockWords,
    total: mockWords.length,
    collectedCount: mockWords.filter((w) => w.collected).length,
  }),

  getReadings: async (): Promise<ReadingsResponse> => ({
    items: mockReadings,
    total: mockReadings.length,
  }),

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
};

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
