import { jsonOk, route } from '@/server/http/api';
import { getCourseDetail } from '@/server/services/course-service';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export const GET = route<Params>(async (_request, context) => {
  const { slug } = await context.params;
  return jsonOk(await getCourseDetail(slug));
});
