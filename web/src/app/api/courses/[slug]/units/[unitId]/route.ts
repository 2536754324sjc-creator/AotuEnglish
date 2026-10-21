import { getLearnerId, jsonOk, route } from '@/server/http/api';
import { getCourseUnit } from '@/server/services/course-service';

export const dynamic = 'force-dynamic';

type Params = { slug: string; unitId: string };

export const GET = route<Params>(async (request, context) => {
  const { slug, unitId } = await context.params;
  return jsonOk(await getCourseUnit(slug, unitId, getLearnerId(request)));
});
