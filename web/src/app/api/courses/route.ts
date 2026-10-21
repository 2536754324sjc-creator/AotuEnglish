import { jsonOk, route } from '@/server/http/api';
import { listCourses } from '@/server/services/course-service';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  const url = new URL(request.url);
  const result = await listCourses({
    level: url.searchParams.get('level'),
    domain: url.searchParams.get('domain'),
  });
  return jsonOk(result);
});
