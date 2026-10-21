import { getLearnerId, jsonOk, route } from '@/server/http/api';
import { getTodayProgress } from '@/server/services/progress-service';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  return jsonOk(await getTodayProgress(getLearnerId(request)));
});
