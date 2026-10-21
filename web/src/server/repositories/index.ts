import { buildSeedData } from '../seed/seed';
import { createMemoryRepository } from './memory';
import type { Repository } from './types';

let repository: Repository | null = null;

/** 进程内单例。P1 按 serverConfig.dataMode 选择 SQL 实现 */
export function getRepository(): Repository {
  if (!repository) {
    repository = createMemoryRepository(buildSeedData());
  }
  return repository;
}

/** 测试用：替换或清空当前仓储 */
export function setRepository(next: Repository | null): void {
  repository = next;
}
