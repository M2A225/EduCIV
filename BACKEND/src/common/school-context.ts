import { UnauthorizedException } from '@nestjs/common';

export function getCurrentSchoolId(req: any): number {
  const user = req.user;
  if (!user) throw new UnauthorizedException('Non authentifié');

  const headerId = req.headers?.['x-school-id'];
  if (headerId) {
    const sid = Number(headerId);
    if (!isNaN(sid) && user.school_ids?.includes(sid)) {
      return sid;
    }
  }
  return user.primary_school_id ?? user.school_ids?.[0];
}
