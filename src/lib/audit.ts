export interface AuditLogParams {
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
}

export async function recordAuditLog(params: AuditLogParams): Promise<void> {
  console.log(`[AUDIT] ${params.action} on ${params.targetType} (${params.targetId || 'N/A'}) by ${params.actorName || params.actorId || 'system'}`);
}
