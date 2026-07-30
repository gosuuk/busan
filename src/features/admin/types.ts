export interface AdminSummaryItem {
  description: string;
  label: string;
  value: number;
}

export interface AdminUserRow {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  nickname: string | null;
  phoneNumber: string;
  role: string;
  status: string;
}

export interface AdminEventRow {
  capacity: number;
  id: string;
  locationName: string;
  startsAt: string;
  status: string;
  title: string;
}

export interface AdminApplicationRow {
  attendanceStatus: string;
  createdAt: string;
  eventId: string;
  eventTitle: string | null;
  id: string;
  memberEmail: string | null;
  memberId: string;
  memberNickname: string | null;
  participationReason: string | null;
}

export interface AdminAuditLogRow {
  action: string;
  actorRole: string | null;
  id: string;
  occurredAt: string;
  targetType: string | null;
}

export interface AdminApplicationLogRow {
  id: string;
  level: string;
  message: string;
  occurredAt: string;
  route: string | null;
}

export interface AdminSecurityLogRow {
  eventType: string;
  id: string;
  occurredAt: string;
  route: string | null;
  severity: string;
}

export interface AdminFeedbackCommentRow {
  authorName: string;
  body: string;
  createdAt: string;
  id: string;
  nextStatus: string | null;
  previousStatus: string | null;
}

export interface AdminFeedbackRow {
  authorName: string;
  comments: AdminFeedbackCommentRow[];
  createdAt: string;
  description: string;
  id: string;
  status: string;
  title: string;
  type: string;
}
