import { NextRequest } from 'next/server';

/**
 * TTS 服务端代理。
 *
 * 为什么不从浏览器直接调百度/有道：
 * - 这两个接口会校验 Referer，跨域请求会被拒
 * - 浏览器直连还会被 CORS 挡住
 * - 服务端代理还能做缓存，同一个词只下载一次
 *
 * 音源优先级：
 *   1. 百度翻译 gettts（音质较好，语速可调）
 *   2. 有道词典 dictvoice（百度失败时兜底）
 *
 * 缓存：内存 Map + Cache-Control 头。生产环境如果要多实例，
 * 建议换成文件缓存或 CDN，否则每个实例各存一份。
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/** 内存缓存：text+rate -> audio buffer */
const cache = new Map<string, { buf: Buffer; type: string }>();

/** 缓存上限，避免内存无限增长（约 2000 条，每条 10-30KB） */
const CACHE_MAX = 2000;

function cacheSet(key: string, buf: Buffer, type: string) {
  if (cache.size >= CACHE_MAX) {
    // 简单淘汰：删最早插入的一条
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, { buf, type });
}

/** 百度翻译：语速可调，spd 1-5 */
async function fetchBaidu(text: string, rate: number): Promise<Buffer> {
  // rate 0.85 -> spd 3（百度 1 最慢，5 最快）
  const spd = Math.min(5, Math.max(1, Math.round(rate * 3.5)));
  const url = `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(
    text,
  )}&spd=${spd}&source=web`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: 'https://fanyi.baidu.com/',
      Accept: '*/*',
    },
    // 百度偶尔慢，给 8 秒
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`baidu ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // 校验是不是真的音频：MP3 以 FF Fx 开头，或 ID3
  if (buf.length < 1000) throw new Error('baidu 返回过短');
  const isMp3 = (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) || buf.subarray(0, 3).toString() === 'ID3';
  if (!isMp3) throw new Error('baidu 返回非 MP3');
  return buf;
}

/** 有道词典：不支持语速，音质稳定 */
async function fetchYoudao(text: string): Promise<Buffer> {
  // type=1 英式，type=2 美式
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: 'https://dict.youdao.com/',
      Accept: '*/*',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`youdao ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error('youdao 返回过短');
  return buf;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get('text') ?? '').trim();
  const rateRaw = Number(searchParams.get('rate') ?? '0.85');
  const rate = Number.isFinite(rateRaw) ? Math.min(1.5, Math.max(0.5, rateRaw)) : 0.85;

  if (!text) {
    return new Response('missing text', { status: 400 });
  }
  // 防御：限制长度，避免被当作通用代理
  if (text.length > 200) {
    return new Response('text too long', { status: 400 });
  }

  const key = `${rate}|${text.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) {
    return new Response(new Uint8Array(hit.buf), {
      headers: {
        'Content-Type': hit.type,
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-Cache': 'HIT',
      },
    });
  }

  // 依次尝试两个音源
  const sources: Array<{ name: string; run: () => Promise<Buffer> }> = [
    { name: 'baidu', run: () => fetchBaidu(text, rate) },
    { name: 'youdao', run: () => fetchYoudao(text) },
  ];

  const errors: string[] = [];
  for (const src of sources) {
    try {
      const buf = await src.run();
      cacheSet(key, buf, 'audio/mpeg');
      return new Response(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-Cache': 'MISS',
          'X-Source': src.name,
        },
      });
    } catch (e) {
      errors.push(`${src.name}: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  }

  // 全部失败：返回 502，前端会自动降级到浏览器合成
  return new Response(`tts failed: ${errors.join('; ')}`, { status: 502 });
}
