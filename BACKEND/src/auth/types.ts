export interface RequestWithUser {
  user?: {
    userId: number;
    role: string;
    school_id?: number;
    school_ids?: number[];
    primary_school_id?: number;
    currentSchoolId?: number;
    scope_by_role?: Record<string, string>;
  };
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown>;
  headers: Record<string, string>;
  route?: { path: string };
}
