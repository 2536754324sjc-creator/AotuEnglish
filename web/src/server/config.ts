/**
 * 后端运行配置。
 * 只放环境相关常量；业务规则（星星、宝箱）在 domain/rules.ts。
 */
export type DataMode = 'memory' | 'sqlite';

function readDataMode(): DataMode {
  return process.env.AOTU_DATA_MODE === 'sqlite' ? 'sqlite' : 'memory';
}

export const serverConfig = {
  dataMode: readDataMode(),
  /** P0 无鉴权时的默认学习者；P2 由登录态替换 */
  defaultLearnerId: process.env.AOTU_DEFAULT_LEARNER_ID?.trim() || 'learner-mia',
  /** 周报按这个时区切日 */
  timeZone: process.env.AOTU_TIME_ZONE?.trim() || 'Asia/Shanghai',
  /** 每完成几关开一个宝箱 */
  starsPerChest: 3,
};
