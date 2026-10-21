import { getLearnerId, jsonOk, route } from '@/server/http/api';
import { getUnitPayload } from '@/server/services/course-service';

export const dynamic = 'force-dynamic';

type Params = { unitId: string };

export const GET = route<Params>(async (request, context) => {
  const { unitId } = await context.params;
  return jsonOk(await getUnitPayload(unitId, getLearnerId(request)));
});
