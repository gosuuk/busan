import { z } from "zod";

const allowedEventNames = [
  "profile_completed",
  "event_list_viewed",
  "event_detail_viewed",
  "event_apply_clicked",
  "post_viewed",
  "post_created",
  "event_viewed",
  "event_registration_started",
  "event_registration_completed",
  "event_registration_canceled",
  "report_submitted",
] as const;

const propertyValueSchema = z.union([
  z.string().max(100),
  z.number(),
  z.boolean(),
  z.null(),
]);

const sensitivePropertyKeyPattern =
  /password|token|secret|authorization|cookie|email|phone|address|ip/i;

const propertiesSchema = z
  .record(propertyValueSchema)
  .superRefine((properties, context) => {
    for (const key of Object.keys(properties)) {
      if (key.length > 50) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Property keys must be 50 characters or shorter.",
          path: [key],
        });
      }

      if (sensitivePropertyKeyPattern.test(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sensitive analytics properties are not allowed.",
          path: [key],
        });
      }
    }
  });

const analyticsEventSchema = z.object({
  eventName: z.enum(allowedEventNames),
  eventVersion: z.number().int().min(1).max(10),
  occurredAt: z.string().datetime(),
  sessionId: z.string().uuid().optional(),
  pagePath: z.string().max(300).optional(),
  referrerDomain: z.string().max(200).optional(),
  entityType: z.enum(["post", "event", "profile"]).optional(),
  entityId: z.string().uuid().optional(),
  properties: propertiesSchema.optional(),
});

export type ParsedAnalyticsEvent = z.infer<typeof analyticsEventSchema>;

export function parseAnalyticsEvent(input: unknown): ParsedAnalyticsEvent {
  return analyticsEventSchema.parse(input);
}
