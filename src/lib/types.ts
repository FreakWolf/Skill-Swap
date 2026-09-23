// Shared domain types for SkillSwap.
// These mirror the database schema (see supabase/migrations) and are the
// contract used across the app — and reusable by the future mobile client.

export type SkillDirection = "teach" | "learn";
export type SkillLevel = "beginner" | "intermediate" | "expert";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type SessionMode = "virtual" | "in_person";
export type LedgerReason =
  | "signup_grant"
  | "booking_hold"
  | "booking_refund"
  | "session_earning"
  | "adjustment";

export const SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "expert"];

export interface Profile {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string | null;
  location: string;
  languages: string[];
  birthdate: string | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  is_custom: boolean;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  direction: SkillDirection;
  level: SkillLevel;
  created_at: string;
}

export interface Offering {
  id: string;
  teacher_id: string;
  skill_id: string;
  title: string;
  description: string;
  level: SkillLevel;
  duration_min: number;
  credit_cost: number;
  mode: SessionMode;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  offering_id: string;
  teacher_id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  offering_id: string;
  slot_id: string;
  learner_id: string;
  teacher_id: string;
  status: BookingStatus;
  credit_cost: number;
  notes: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: LedgerReason;
  booking_id: string | null;
  created_at: string;
}

// A joined shape used by the marketplace: an offering with its teacher + skill.
export interface OfferingWithDetails extends Offering {
  skill: Skill;
  teacher: Pick<Profile, "id" | "full_name" | "avatar_url" | "location">;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

// A conversation summarized for the inbox: the other participant, the last
// message preview, and how many messages are unread by the current user.
export interface ConversationSummary {
  id: string;
  other: { id: string; full_name: string; avatar_url: string | null };
  lastMessage: string;
  lastMessageAt: string | null;
  unread: number;
}

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
