import { serverConfig } from '@/server/config';
import { jsonOk } from '@/server/http/api';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  return jsonOk({
    status: 'ok',
    dataMode: serverConfig.dataMode,
    timeZone: serverConfig.timeZone,
    now: new Date().toISOString(),
  });
}
