'use client';

import { use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { PageError, PageLoading } from '@/components/page-states';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { AnswerReport, DoneHandoff } from '@/lib/types';
import { UnitPlayer } from '@/features/learn/unit-player';
import { writeHandoff } from '@/lib/done-handoff';
import styles from './unit.module.css';

type Params = Promise<{ unitId: string }>;

export default function UnitPage({ params }: { params: Params }) {
  const { unitId } = use(params);
  const { data, error, loading, reload } = useApi(() => api.getUnit(unitId), [unitId]);
  const unit = data?.unit ?? null;
  const router = useRouter();

  /**
   * 结算前先上报（契约 §4.6），星星以服务端返回为准。
   *
   * 为什么这里必须落库：HANDOFF §三 第 2 项 —— 之前结算页只用 `?stars=`，
   * 刷新即丢失，进度不推进。现在把答案批量提交，再把服务端结果带进结算页。
   *
   * 失败策略：不阻塞学习者看结算页（内容已答完，卡在错误页体验很差），
   * 而是带上 submitError 标记，由结算页明确告知「这次没存上」并给重试入口。
   */
  const goDone = useCallback(
    async (stars: number, report: AnswerReport) => {
      let handoff: DoneHandoff = { stars };
      try {
        const result = await api.submitSession({
          unitId,
          startedAt: report.startedAt,
          finishedAt: report.finishedAt,
          answers: report.answers,
        });
        handoff = {
          stars: result.stars,
          starTotal: result.starTotal,
          nextUnitId: result.nextUnitId,
        };
      } catch (e) {
        // 409 = 10 秒内重复提交，视为已成功，不必打扰用户
        const duplicated = e instanceof Error && 'status' in e && (e as { status: number }).status === 409;
        if (!duplicated) {
          console.warn('[session] 上报失败，结果未保存', e);
          handoff = { stars, submitError: true };
        }
      }

      /**
       * 结果通过 sessionStorage 传给结算页。
       *
       * 试过两条更"顺"的路，都不行（实测过）：
       * 1. `router.replace(url, { state })` —— Next 16 的 NavigateOptions 没有 state 字段
       * 2. 先写 `history.replaceState({ usr })` 再 `router.replace()` ——
       *    App Router 导航会用自己的 `{ __NA, __PRIVATE_NEXTJS_INTERNALS_TREE }` 覆盖整个条目，
       *    usr 被整个丢掉（实测 history.state 里没有 usr）
       * 所以用 sessionStorage：同标签页内有效、刷新存活、不落 URL、关掉标签页即清。
       */
      writeHandoff(handoff);
      router.replace(`/learn/unit/${unitId}/done`);
    },
    [router, unitId],
  );

  if (loading) {
    return (
      <div className={styles.missing}>
        <IconSprite />
        <PageLoading label="正在准备这一关…" />
      </div>
    );
  }

  // 404 不重试（内容不存在），网络错误可以重试
  if (error) {
    return (
      <div className={styles.missing}>
        <IconSprite />
        <PageError error={error} onRetry={reload} />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className={styles.missing}>
        <IconSprite />
        <p>找不到这一关</p>
        <Link href="/learn">回到学习地图</Link>
      </div>
    );
  }

  return <UnitPlayer unit={unit} onFinish={goDone} onExit={() => router.push('/learn')} />;
}
