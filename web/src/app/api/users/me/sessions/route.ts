import { getLearnerId, jsonCreated, jsonOk, readJson, route } from '@/server/http/api';
import { submitSession } from '@/server/services/session-service';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  const body = await readJson(request);
  const result = await submitSession(getLearnerId(request), body);
  return result.deduplicated ? jsonOk(result) : jsonCreated(result);
});
