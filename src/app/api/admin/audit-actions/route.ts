import { ZodError } from "zod";
import { z } from "zod";

import {
  recordAdminAuditLog,
  requireAdminApiSession,
} from "@/server/auth/local/admin-security";
import { jsonError } from "@/server/http/responses";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

const allowedAdminAuditActions = [
  "admin_nav_clicked",
  "admin_api_users_opened",
  "admin_users_refresh_clicked",
  "admin_logout_clicked",
  "admin_event_form_submitted",
  "admin_event_edit_clicked",
  "admin_offline_event_updated",
] as const;

const adminAuditActionSchema = z.object({
  action: z.enum(allowedAdminAuditActions),
  targetType: z.string().max(50).optional(),
  targetId: z.string().max(120).optional(),
  reason: z.string().max(200).optional(),
  metadata: z
    .record(
      z.string().max(50),
      z.union([
        z.string().max(120),
        z.number(),
        z.boolean(),
        z.null(),
      ]),
    )
    .optional(),
});

export async function POST(request: Request): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/audit-actions",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await readJsonBody(request, {
      maxBytes: 8_000,
    });
    const parsed = adminAuditActionSchema.parse(body);

    await recordAdminAuditLog({
      action: parsed.action,
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      reason: parsed.reason,
      metadata: parsed.metadata,
    });

    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError("Invalid audit action payload", 400, "INVALID_BODY");
    }

    return jsonError("Unable to record audit action", 500, "AUDIT_FAILED");
  }
}
