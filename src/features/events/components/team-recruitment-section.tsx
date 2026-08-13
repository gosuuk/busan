"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiClientError, apiRequest } from "@/lib/api-client";

interface TeamRoomView {
  acceptedMembers: { id: string; name: string }[];
  applications: {
    id: string;
    memberId: string;
    memberName: string;
    message: string | null;
    status: string;
    disclosureConsentGrantedAt: string | null;
    disclosureConsentVersion: string | null;
    profile: {
      profileId: string | null;
      nickname: string | null;
      name: string | null;
      email: string | null;
      introduction: string | null;
      jobCategory: string | null;
      experienceRange: string | null;
      githubUrl: string | null;
      portfolioUrl: string | null;
      publicEmail: string | null;
      interestedTopics: string[];
      activityAreas: string[];
      networkingGoals: string[];
    } | null;
  }[];
  capacity: number;
  contact: string | null;
  description: string;
  id: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  neededRoles: string[];
  status: string;
  title: string;
  viewerApplication: { id: string; status: string } | null;
}

interface TeamRecruitmentSectionProps {
  canCreateTeam: boolean;
  eventId: string;
  isEventEnded: boolean;
  isLoggedIn: boolean;
  loginPath: string;
  rooms: TeamRoomView[];
  viewerId?: string;
}

const teamStatusLabels: Record<string, string> = {
  recruiting: "모집 중",
  full: "모집 완료",
  closed: "모집 종료",
};

const applicationStatusLabels: Record<string, string> = {
  pending: "승인 대기",
  accepted: "팀 합류 완료",
  rejected: "지원 반려",
  cancelled: "지원 취소",
};

const initialRoomForm = {
  title: "",
  description: "",
  neededRoles: "",
  capacity: "4",
  contact: "",
};

export function TeamRecruitmentSection({
  canCreateTeam,
  eventId,
  isEventEnded,
  isLoggedIn,
  loginPath,
  rooms,
  viewerId,
}: TeamRecruitmentSectionProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [applyMessages, setApplyMessages] = useState<Record<string, string>>({});
  const [disclosureConsents, setDisclosureConsents] = useState<
    Record<string, boolean>
  >({});
  const [expandedApplicantId, setExpandedApplicantId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const ownsRoom = rooms.some((room) => room.leaderId === viewerId);

  async function createRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyKey("create");
    setMessage(null);

    try {
      await apiRequest(`/api/events/${eventId}/teams`, {
        method: "POST",
        json: {
          title: roomForm.title,
          description: roomForm.description,
          neededRoles: splitTags(roomForm.neededRoles),
          capacity: Number.parseInt(roomForm.capacity, 10),
          contact: roomForm.contact || undefined,
        },
      });
      setRoomForm(initialRoomForm);
      setShowCreateForm(false);
      setMessage("팀 모집방을 만들었습니다.");
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error, "팀 모집방을 만들지 못했습니다."));
    } finally {
      setBusyKey(null);
    }
  }

  async function applyRoom(roomId: string) {
    setBusyKey(`apply-${roomId}`);
    setMessage(null);

    try {
      await apiRequest(`/api/team-rooms/${roomId}/applications`, {
        method: "POST",
        json: {
          message: applyMessages[roomId] ?? "",
          profileDisclosureConsent: disclosureConsents[roomId] === true,
        },
      });
      setDisclosureConsents((current) => ({ ...current, [roomId]: false }));
      setMessage("팀 지원을 보냈습니다. 방장의 승인을 기다려주세요.");
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error, "팀 지원을 처리하지 못했습니다."));
    } finally {
      setBusyKey(null);
    }
  }

  async function cancelApplication(roomId: string) {
    setBusyKey(`cancel-${roomId}`);
    setMessage(null);

    try {
      await apiRequest(`/api/team-rooms/${roomId}/applications`, {
        method: "DELETE",
      });
      setMessage("팀 지원을 취소했습니다.");
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error, "지원 취소를 처리하지 못했습니다."));
    } finally {
      setBusyKey(null);
    }
  }

  async function manageApplication(
    roomId: string,
    applicationId: string,
    status: "accepted" | "rejected",
  ) {
    setBusyKey(`${status}-${applicationId}`);
    setMessage(null);

    try {
      await apiRequest(
        `/api/team-rooms/${roomId}/applications/${applicationId}`,
        { method: "PATCH", json: { status } },
      );
      setMessage(status === "accepted" ? "팀원을 승인했습니다." : "지원을 반려했습니다.");
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error, "지원자 상태를 변경하지 못했습니다."));
    } finally {
      setBusyKey(null);
    }
  }

  async function updateRoomStatus(roomId: string, status: string) {
    setBusyKey(`room-${roomId}`);
    setMessage(null);

    try {
      await apiRequest(`/api/team-rooms/${roomId}`, {
        method: "PATCH",
        json: { status },
      });
      setMessage("팀 모집 상태를 변경했습니다.");
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error, "팀 상태를 변경하지 못했습니다."));
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="site-container pb-14">
      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">Team Building</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">팀원 모집방</h2>
            <p className="mt-3 text-sm leading-6 text-ink/60">
              행사 참가 신청을 마친 회원은 누구나 방장이 되어 팀원을 모집할 수
              있습니다.
            </p>
          </div>
          {isLoggedIn ? (
            <button
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canCreateTeam || ownsRoom || isEventEnded}
              onClick={() => setShowCreateForm((current) => !current)}
              type="button"
            >
              {ownsRoom ? "이미 팀을 만들었습니다" : "+ 팀 모집방 만들기"}
            </button>
          ) : (
            <Link
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
              href={loginPath}
            >
              로그인하고 팀 만들기
            </Link>
          )}
        </div>

        {isLoggedIn && !canCreateTeam && !isEventEnded ? (
          <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            먼저 위의 행사 참가 신청을 완료하면 팀을 만들거나 지원할 수 있습니다.
          </p>
        ) : null}

        {message ? (
          <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {message}
          </p>
        ) : null}

        {showCreateForm ? (
          <form
            className="mt-6 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-5"
            onSubmit={createRoom}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="팀 이름">
                <input
                  className="form-input mt-2"
                  onChange={(event) =>
                    setRoomForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="부산 AI 챌린저스"
                  required
                  value={roomForm.title}
                />
              </FormField>
              <FormField label="팀 정원 (방장 포함)">
                <input
                  className="form-input mt-2"
                  max={20}
                  min={2}
                  onChange={(event) =>
                    setRoomForm((current) => ({ ...current, capacity: event.target.value }))
                  }
                  required
                  type="number"
                  value={roomForm.capacity}
                />
              </FormField>
            </div>
            <FormField label="팀 소개">
              <textarea
                className="form-input mt-2 min-h-28 py-3"
                onChange={(event) =>
                  setRoomForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="만들고 싶은 결과물과 협업 방식을 10자 이상 소개해주세요."
                required
                value={roomForm.description}
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="모집 역할">
                <input
                  className="form-input mt-2"
                  onChange={(event) =>
                    setRoomForm((current) => ({ ...current, neededRoles: event.target.value }))
                  }
                  placeholder="프론트엔드, 디자이너"
                  value={roomForm.neededRoles}
                />
              </FormField>
              <FormField label="연락 방법 (승인된 팀원에게만 공개)">
                <input
                  className="form-input mt-2"
                  onChange={(event) =>
                    setRoomForm((current) => ({ ...current, contact: event.target.value }))
                  }
                  placeholder="오픈채팅 URL 또는 이메일"
                  value={roomForm.contact}
                />
              </FormField>
            </div>
            <button
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:bg-blue-300 md:w-fit"
              disabled={busyKey === "create"}
              type="submit"
            >
              {busyKey === "create" ? "만드는 중" : "모집 시작하기"}
            </button>
          </form>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {rooms.length ? (
            rooms.map((room) => {
              const isLeader = room.leaderId === viewerId;
              const canApply =
                canCreateTeam &&
                !isLeader &&
                room.status === "recruiting" &&
                room.memberCount < room.capacity &&
                (!room.viewerApplication ||
                  ["rejected", "cancelled"].includes(room.viewerApplication.status));

              return (
                <article
                  className="rounded-2xl border border-blue-100 bg-slate-50 p-5"
                  key={room.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {teamStatusLabels[room.status] ?? room.status}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-ink">{room.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-ink/50">
                        방장 {room.leaderName}
                      </p>
                    </div>
                    <span className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-ink ring-1 ring-blue-100">
                      {room.memberCount}/{room.capacity}명
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-ink/65">
                    {room.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.neededRoles.map((role) => (
                      <span
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
                        key={role}
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-4 text-sm text-ink/60">
                    <p className="font-bold text-ink">현재 팀원</p>
                    <p className="mt-2">
                      {[
                        `${room.leaderName}(방장)`,
                        ...room.acceptedMembers.map((member) => member.name),
                      ].join(", ")}
                    </p>
                    {room.contact ? (
                      <p className="mt-3 break-all font-semibold text-blue-700">
                        연락: {room.contact}
                      </p>
                    ) : null}
                  </div>

                  {isLeader ? (
                    <div className="mt-4 grid gap-3">
                      <label className="text-sm font-bold text-ink">
                        모집 상태
                        <select
                          className="form-input mt-2"
                          disabled={busyKey === `room-${room.id}`}
                          onChange={(event) => updateRoomStatus(room.id, event.target.value)}
                          value={room.status}
                        >
                          <option value="recruiting">모집 중</option>
                          <option value="full">모집 완료</option>
                          <option value="closed">모집 종료</option>
                        </select>
                      </label>
                      <p className="text-sm font-bold text-ink">지원자 관리</p>
                      {room.applications.length ? (
                        room.applications.map((application) => (
                          <div
                            className="rounded-xl border border-blue-100 bg-white p-4"
                            key={application.id}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <strong className="text-sm text-ink">
                                {application.memberName}
                              </strong>
                              <span className="text-xs font-bold text-blue-700">
                                {applicationStatusLabels[application.status] ?? application.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-ink/60">
                              {application.message || "지원 메시지가 없습니다."}
                            </p>
                            {application.profile ? (
                              <div className="mt-3">
                                <p className="mb-2 text-xs font-semibold text-emerald-700">
                                  정보 공개 동의 완료 ·{" "}
                                  {application.disclosureConsentGrantedAt
                                    ? new Date(
                                        application.disclosureConsentGrantedAt,
                                      ).toLocaleString("ko-KR")
                                    : "동의 시각 없음"}
                                </p>
                                <button
                                  aria-expanded={expandedApplicantId === application.id}
                                  className="text-sm font-bold text-blue-600 underline decoration-blue-200 underline-offset-4"
                                  onClick={() =>
                                    setExpandedApplicantId((current) =>
                                      current === application.id
                                        ? null
                                        : application.id,
                                    )
                                  }
                                  type="button"
                                >
                                  {expandedApplicantId === application.id
                                    ? "지원자 정보 닫기"
                                    : "지원자 정보 보기"}
                                </button>
                                {expandedApplicantId === application.id ? (
                                  <ApplicantProfile profile={application.profile} />
                                ) : null}
                              </div>
                            ) : (
                              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-ink/45">
                                정보 공개 동의 기록이 없어 상세정보를 표시하지 않습니다.
                              </p>
                            )}
                            {application.status === "pending" ? (
                              <div className="mt-3 flex gap-2">
                                <button
                                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:bg-blue-300"
                                  disabled={busyKey !== null}
                                  onClick={() =>
                                    manageApplication(room.id, application.id, "accepted")
                                  }
                                  type="button"
                                >
                                  승인
                                </button>
                                <button
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink disabled:text-ink/30"
                                  disabled={busyKey !== null}
                                  onClick={() =>
                                    manageApplication(room.id, application.id, "rejected")
                                  }
                                  type="button"
                                >
                                  반려
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-ink/50">아직 지원자가 없습니다.</p>
                      )}
                    </div>
                  ) : room.viewerApplication &&
                    !["rejected", "cancelled"].includes(room.viewerApplication.status) ? (
                    <div className="mt-4 rounded-xl bg-blue-50 p-4">
                      <p className="text-sm font-bold text-blue-700">
                        {applicationStatusLabels[room.viewerApplication.status]}
                      </p>
                      <button
                        className="mt-3 text-xs font-bold text-ink/55 underline disabled:text-ink/25"
                        disabled={busyKey !== null}
                        onClick={() => cancelApplication(room.id)}
                        type="button"
                      >
                        팀 지원 취소
                      </button>
                    </div>
                  ) : canApply ? (
                    <div className="mt-4 grid gap-3">
                      <textarea
                        className="form-input min-h-20 py-3"
                        onChange={(event) =>
                          setApplyMessages((current) => ({
                            ...current,
                            [room.id]: event.target.value,
                          }))
                        }
                        placeholder="경험과 함께하고 싶은 역할을 소개해주세요."
                        value={applyMessages[room.id] ?? ""}
                      />
                      <label className="rounded-xl border border-blue-100 bg-white p-4">
                        <span className="flex items-start gap-3">
                          <input
                            checked={disclosureConsents[room.id] === true}
                            className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                            onChange={(event) =>
                              setDisclosureConsents((current) => ({
                                ...current,
                                [room.id]: event.target.checked,
                              }))
                            }
                            type="checkbox"
                          />
                          <span>
                            <strong className="block text-sm text-ink">
                              지원자 정보 공개 동의 (필수)
                            </strong>
                            <span className="mt-2 block text-xs leading-5 text-ink/55">
                              팀원 선발과 연락을 위해 이름·닉네임, 계정 이메일,
                              직군·경력·소개, 관심 분야, GitHub·포트폴리오·공개
                              이메일을 지원한 팀의 방장에게 공개합니다. 지원 취소
                              또는 반려 시 상세정보 공개가 중단됩니다.
                            </span>
                          </span>
                        </span>
                      </label>
                      <button
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:bg-blue-300"
                        disabled={
                          busyKey !== null ||
                          disclosureConsents[room.id] !== true
                        }
                        onClick={() => applyRoom(room.id)}
                        type="button"
                      >
                        이 팀에 지원하기
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center text-sm text-ink/55 lg:col-span-2">
              아직 만들어진 팀이 없습니다. 첫 번째 방장이 되어보세요.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ApplicantProfile({
  profile,
}: {
  profile: NonNullable<TeamRoomView["applications"][number]["profile"]>;
}) {
  return (
    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ApplicantInfo
          label="이름·닉네임"
          value={
            [profile.name, profile.nickname].filter(Boolean).join(" · ") ||
            "미입력"
          }
        />
        <ApplicantInfo label="계정 이메일" value={profile.email ?? "미입력"} />
        <ApplicantInfo label="직군" value={profile.jobCategory ?? "미입력"} />
        <ApplicantInfo
          label="경력"
          value={profile.experienceRange ?? "미입력"}
        />
      </div>

      <div className="mt-3 rounded-lg bg-white p-3">
        <p className="text-xs font-bold text-blue-700">자기소개</p>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink/65">
          {profile.introduction ?? "미입력"}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ApplicantTags label="관심 기술" values={profile.interestedTopics} />
        <ApplicantTags label="활동 지역" values={profile.activityAreas} />
        <ApplicantTags label="참여 목적" values={profile.networkingGoals} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {profile.githubUrl ? (
          <ExternalProfileLink href={profile.githubUrl}>GitHub</ExternalProfileLink>
        ) : null}
        {profile.portfolioUrl ? (
          <ExternalProfileLink href={profile.portfolioUrl}>
            포트폴리오
          </ExternalProfileLink>
        ) : null}
        {profile.publicEmail ? (
          <a
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"
            href={`mailto:${profile.publicEmail}`}
          >
            공개 이메일로 연락
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ApplicantInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-bold text-blue-700">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function ApplicantTags({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-bold text-blue-700">{label}</p>
      <p className="mt-2 text-xs leading-5 text-ink/60">
        {values.length ? values.join(", ") : "미입력"}
      </p>
    </div>
  );
}

function ExternalProfileLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a
      className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-blue-700"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

function FormField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof ApiClientError &&
    typeof error.payload === "object" &&
    error.payload !== null &&
    "message" in error.payload &&
    typeof error.payload.message === "string"
  ) {
    return error.payload.message;
  }

  return fallback;
}
