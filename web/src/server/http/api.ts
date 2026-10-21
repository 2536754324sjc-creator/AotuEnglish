import { serverConfig } from '../config';

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'LEARNER_NOT_FOUND'
  | 'COURSE_NOT_FOUND'
  | 'UNIT_NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'INTERNAL';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  LEARNER_NOT_FOUND: 404,
  COURSE_NOT_FOUND: 404,
  UNIT_NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }
}

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; details?: unknown } };

export function jsonOk<T>(data: T): Response {
  return Response.json({ ok: true, data } satisfies ApiEnvelope<T>, {
    status: 200,
    headers: NO_STORE,
  });
}

export function jsonCreated<T>(data: T): Response {
  return Response.json({ ok: true, data } satisfies ApiEnvelope<T>, {
    status: 201,
    headers: NO_STORE,
  });
}

function jsonError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { ok: false, error: { code: error.code, message: error.message, details: error.details ?? null } },
      { status: error.status, headers: NO_STORE },
    );
  }

  return Response.json(
    { ok: false, error: { code: 'INTERNAL', message: '服务暂时不可用', details: null } },
    { status: 500, headers: NO_STORE },
  );
}

/** 解析请求体；body 不是合法 JSON 一律 400 */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError('BAD_REQUEST', '请求体不是合法 JSON');
  }
}

/** P0 用请求头指定学习者；缺省走配置。P2 换成登录态 */
export function getLearnerId(request: Request): string {
  return request.headers.get('x-learner-id')?.trim() || serverConfig.defaultLearnerId;
}

export type RouteContext<P extends Record<string, string> = Record<string, string>> = {
  params: Promise<P>;
};

/**
 * 路由包装：统一信封、统一异常映射，并忽略 500 的堆栈。
 * handler 返回 Response 时原样透传（用于 201）。
 */
export function route<P extends Record<string, string> = Record<string, string>>(
  handler: (request: Request, context: RouteContext<P>) => Promise<unknown> | unknown,
): (request: Request, context: RouteContext<P>) => Promise<Response> {
  return async (request, context) => {
    try {
      const result = await handler(request, context);
      if (result instanceof Response) return result;
      return jsonOk(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error('[api] unhandled error', error);
      }
      return jsonError(error);
    }
  };
}
