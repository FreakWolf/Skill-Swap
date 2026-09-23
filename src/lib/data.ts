import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { OfferingWithDetails, TeacherSummary } from "@/lib/types";

// The select string that joins an offering to its skill + teacher profile.
const OFFERING_SELECT = `
  id, teacher_id, skill_id, title, description, level, duration_min,
  credit_cost, mode, is_active, created_at, updated_at,
  skill:skills!offerings_skill_id_fkey ( id, name, category, is_custom, created_at ),
  teacher:profiles!offerings_teacher_id_fkey ( id, full_name, avatar_url, location )
`;

type RawOffering = Record<string, unknown>;

// Supabase returns joined relations as either an object or a single-element
// array depending on the relationship; normalize to our flat shape.
function normalize(row: RawOffering): OfferingWithDetails {
  const skill = Array.isArray(row.skill) ? row.skill[0] : row.skill;
  const teacher = Array.isArray(row.teacher) ? row.teacher[0] : row.teacher;
  return { ...(row as object), skill, teacher } as OfferingWithDetails;
}

// A user's skills with names, split by direction — for profile pages.
export async function getUserSkills(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_skills")
    .select(
      `id, direction, level,
       skill:skills!user_skills_skill_id_fkey ( name, category )`,
    )
    .eq("user_id", userId);

  const rows = (data ?? []).map((r) => {
    const skill = Array.isArray(r.skill) ? r.skill[0] : r.skill;
    return {
      id: r.id as string,
      direction: r.direction as "teach" | "learn",
      level: r.level as string,
      name: (skill?.name as string) ?? "Skill",
    };
  });
  return {
    teach: rows.filter((r) => r.direction === "teach"),
    learn: rows.filter((r) => r.direction === "learn"),
  };
}

// Active offerings published by a teacher.
export async function getOfferingsByTeacher(
  teacherId: string,
): Promise<OfferingWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offerings")
    .select(OFFERING_SELECT)
    .eq("teacher_id", teacherId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return (data ?? []).map(normalize);
}

// Skill ids the user wants to learn — used to recommend matching offerings.
export async function getLearningSkillIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_skills")
    .select("skill_id")
    .eq("user_id", userId)
    .eq("direction", "learn");
  return (data ?? []).map((r) => r.skill_id as string);
}

// Recommended offerings: those teaching a skill the user wants to learn.
export async function getRecommendedOfferings(
  userId: string,
  limit = 6,
): Promise<OfferingWithDetails[]> {
  const learnIds = await getLearningSkillIds(userId);
  const supabase = await createClient();

  let query = supabase
    .from("offerings")
    .select(OFFERING_SELECT)
    .eq("is_active", true)
    .neq("teacher_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (learnIds.length > 0) {
    query = query.in("skill_id", learnIds);
  }

  const { data } = await query;
  return (data ?? []).map(normalize);
}

// Browse/search offerings for the marketplace.
export async function searchOfferings(opts: {
  userId: string;
  q?: string;
  category?: string;
  limit?: number;
}): Promise<OfferingWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offerings")
    .select(OFFERING_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 40);
  let rows = (data ?? []).map(normalize);

  // Filter client-side over the joined fields (simple + fine at MVP scale).
  if (opts.q) {
    const q = opts.q.toLowerCase();
    rows = rows.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.skill?.name?.toLowerCase().includes(q) ||
        o.teacher?.full_name?.toLowerCase().includes(q),
    );
  }
  if (opts.category && opts.category !== "All") {
    rows = rows.filter((o) => o.skill?.category === opts.category);
  }
  return rows;
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("skills").select("category");
  const set = new Set((data ?? []).map((r) => r.category as string));
  return ["All", ...Array.from(set).sort()];
}

// Reviews about a given user (as reviewee), newest first, with reviewer name.
export async function getReviewsFor(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, created_at,
       reviewer:profiles!reviews_reviewer_id_fkey ( full_name, avatar_url )`,
    )
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((r) => {
    const reviewer = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer;
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: r.comment as string,
      created_at: r.created_at as string,
      reviewerName: (reviewer?.full_name as string) || "Member",
      reviewerAvatar: (reviewer?.avatar_url as string) ?? null,
    };
  });
}

export async function getRatingSummary(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", userId);
  const ratings = (data ?? []).map((r) => r.rating as number);
  const count = ratings.length;
  const avg = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;
  return { count, avg };
}

// A booking joined with its offering (title/skill) and both participants.
const BOOKING_SELECT = `
  id, offering_id, slot_id, learner_id, teacher_id, status, credit_cost,
  notes, starts_at, ends_at, created_at, updated_at,
  offering:offerings!bookings_offering_id_fkey (
    title,
    skill:skills!offerings_skill_id_fkey ( name )
  ),
  learner:profiles!bookings_learner_id_fkey ( id, full_name, avatar_url ),
  teacher:profiles!bookings_teacher_id_fkey ( id, full_name, avatar_url )
`;

export interface BookingWithDetails {
  id: string;
  learner_id: string;
  teacher_id: string;
  status: string;
  credit_cost: number;
  notes: string;
  starts_at: string;
  ends_at: string;
  title: string;
  skillName: string;
  learner: { id: string; full_name: string; avatar_url: string | null };
  teacher: { id: string; full_name: string; avatar_url: string | null };
}

function normalizeBooking(row: Record<string, unknown>): BookingWithDetails {
  const offering = Array.isArray(row.offering) ? row.offering[0] : row.offering;
  const skill = offering
    ? Array.isArray(offering.skill)
      ? offering.skill[0]
      : offering.skill
    : null;
  const learner = Array.isArray(row.learner) ? row.learner[0] : row.learner;
  const teacher = Array.isArray(row.teacher) ? row.teacher[0] : row.teacher;
  return {
    id: row.id as string,
    learner_id: row.learner_id as string,
    teacher_id: row.teacher_id as string,
    status: row.status as string,
    credit_cost: row.credit_cost as number,
    notes: (row.notes as string) ?? "",
    starts_at: row.starts_at as string,
    ends_at: row.ends_at as string,
    title: (offering?.title as string) ?? "Session",
    skillName: (skill?.name as string) ?? "",
    learner,
    teacher,
  };
}

export async function getMyBookings(userId: string): Promise<BookingWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .or(`learner_id.eq.${userId},teacher_id.eq.${userId}`)
    .order("starts_at", { ascending: false });
  return (data ?? []).map(normalizeBooking);
}

export async function getBookingDetail(
  bookingId: string,
): Promise<BookingWithDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .maybeSingle();
  return data ? normalizeBooking(data as Record<string, unknown>) : null;
}

// Has the current user already reviewed this booking?
export async function hasReviewed(bookingId: string, reviewerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();
  return Boolean(data);
}

// A single offering with its open (unbooked, future) slots.
export async function getOfferingWithSlots(offeringId: string) {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("offerings")
    .select(OFFERING_SELECT)
    .eq("id", offeringId)
    .maybeSingle();
  if (!raw) return null;

  const offering = normalize(raw as RawOffering);
  const { data: slots } = await supabase
    .from("availability")
    .select("*")
    .eq("offering_id", offeringId)
    .eq("is_booked", false)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  return { offering, slots: slots ?? [] };
}

// People/discovery: users who list at least one "teach" skill, with their
// teach-skill names, rating summary, and active offering count. Optionally
// filtered by name or skill name via `q`. Excludes the current user.
export async function searchTeachers(opts: {
  userId: string;
  q?: string;
  limit?: number;
}): Promise<TeacherSummary[]> {
  const supabase = await createClient();

  // All "teach" links joined to the teacher profile + skill name.
  const { data: rows } = await supabase
    .from("user_skills")
    .select(
      `user_id, level,
       skill:skills!user_skills_skill_id_fkey ( name ),
       teacher:profiles!user_skills_user_id_fkey ( id, full_name, avatar_url, location, bio )`,
    )
    .eq("direction", "teach");

  if (!rows || rows.length === 0) return [];

  // Group by teacher.
  const byTeacher = new Map<string, TeacherSummary>();
  for (const r of rows) {
    const teacher = Array.isArray(r.teacher) ? r.teacher[0] : r.teacher;
    const skill = Array.isArray(r.skill) ? r.skill[0] : r.skill;
    const tid = teacher?.id as string | undefined;
    if (!tid || tid === opts.userId) continue; // skip self / orphans

    if (!byTeacher.has(tid)) {
      byTeacher.set(tid, {
        id: tid,
        full_name: (teacher.full_name as string) || "SkillSwap member",
        avatar_url: (teacher.avatar_url as string) ?? null,
        location: (teacher.location as string) ?? "",
        bio: (teacher.bio as string) ?? "",
        teachSkills: [],
        rating: { avg: 0, count: 0 },
        offeringCount: 0,
      });
    }
    const name = skill?.name as string | undefined;
    if (name && !byTeacher.get(tid)!.teachSkills.includes(name)) {
      byTeacher.get(tid)!.teachSkills.push(name);
    }
  }

  let teachers = Array.from(byTeacher.values());

  // Text filter over name or any teach skill.
  if (opts.q) {
    const q = opts.q.toLowerCase();
    teachers = teachers.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        t.teachSkills.some((s) => s.toLowerCase().includes(q)),
    );
  }

  teachers = teachers.slice(0, opts.limit ?? 40);
  if (teachers.length === 0) return [];

  const ids = teachers.map((t) => t.id);

  // Ratings + active offering counts for the resulting teachers.
  const [{ data: reviews }, { data: offerings }] = await Promise.all([
    supabase.from("reviews").select("reviewee_id, rating").in("reviewee_id", ids),
    supabase
      .from("offerings")
      .select("teacher_id")
      .eq("is_active", true)
      .in("teacher_id", ids),
  ]);

  const ratingAgg = new Map<string, { sum: number; count: number }>();
  for (const rv of reviews ?? []) {
    const k = rv.reviewee_id as string;
    const cur = ratingAgg.get(k) ?? { sum: 0, count: 0 };
    cur.sum += rv.rating as number;
    cur.count += 1;
    ratingAgg.set(k, cur);
  }
  const offeringAgg = new Map<string, number>();
  for (const o of offerings ?? []) {
    const k = o.teacher_id as string;
    offeringAgg.set(k, (offeringAgg.get(k) ?? 0) + 1);
  }

  for (const t of teachers) {
    const agg = ratingAgg.get(t.id);
    t.rating = agg
      ? { avg: agg.sum / agg.count, count: agg.count }
      : { avg: 0, count: 0 };
    t.offeringCount = offeringAgg.get(t.id) ?? 0;
  }

  return teachers;
}
