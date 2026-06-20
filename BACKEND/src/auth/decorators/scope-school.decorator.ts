import { SetMetadata } from '@nestjs/common';

export const SCOPE_SCHOOL_KEY = 'scope_school';

export const ScopeSchool = (
  source: 'param' | 'query' | 'body' | 'header' | 'user',
  key?: string,
) => SetMetadata(SCOPE_SCHOOL_KEY, { source, key });
