import { getLearnerId, jsonOk, route } from '@/server/http/api';
import { getWeeklyReport } from '@/server/services/report-service';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  const url = new URL(request.url);
  return jsonOk(await getWeeklyReport(getLearnerId(request), url.searchParams.get('week')));
});
