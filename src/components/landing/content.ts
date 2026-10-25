import {
  Briefcase,
  Camera,
  Code2,
  Languages,
  Leaf,
  Music,
  Palette,
  Puzzle,
  type LucideIcon,
} from "lucide-react";

// Mirrors the starter skill catalog in supabase/seed.sql (no DB call, so the
// landing page stays static). Members can also add any custom skill.
// Keep in sync if the seed catalog changes. Never show counts here.
export const CATEGORIES: { name: string; icon: LucideIcon; skills: string[] }[] = [
  { name: "Programming", icon: Code2, skills: ["JavaScript", "Python", "React", "SQL & Databases"] },
  { name: "Design", icon: Palette, skills: ["UI/UX Design", "Figma"] },
  { name: "Creative", icon: Camera, skills: ["Photography", "Watercolor Painting"] },
  { name: "Music", icon: Music, skills: ["Guitar", "Piano", "Singing"] },
  { name: "Languages", icon: Languages, skills: ["Spanish", "French", "English Conversation"] },
  { name: "Business", icon: Briefcase, skills: ["Public Speaking", "Resume & Interview Prep", "Digital Marketing"] },
  { name: "Lifestyle", icon: Leaf, skills: ["Cooking Basics", "Yoga"] },
  { name: "Games", icon: Puzzle, skills: ["Chess"] },
];

// Plain-text Q&As. Rendered on the page AND used for the FAQPage JSON-LD,
// so the structured data always matches what visitors can read.
export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is a credit?",
    a: "Credits are how sessions are paid for on SwapSkills. Teachers set a credit cost for each session, and the guide is 1 credit = 1 hour. You earn credits by teaching and spend them to learn.",
  },
  {
    q: "Is SwapSkills free?",
    a: "Yes. Joining is free and you get 3 free credits when you sign up. You can earn more by teaching. Buying a credit pack is optional, for when you want to learn more than you teach.",
  },
  {
    q: "How do sessions happen?",
    a: "After you book a time slot, you and the teacher sort out the details in chat. Today, members share a Zoom or Google Meet link, or a place to meet, in the chat. There is no built-in video call yet.",
  },
  {
    q: "Can I withdraw my credits as money?",
    a: "No. Credits can only be used on SwapSkills. They can't be withdrawn or exchanged for money.",
  },
  {
    q: "Who can join?",
    a: "Anyone aged 18 or older. You confirm your birthdate when you sign up.",
  },
  {
    q: "How do payments work?",
    a: "Credit packs are paid securely through Razorpay (UPI, cards, netbanking and wallets). Prices include taxes, and SwapSkills never sees your card or bank details. No cash changes hands between members.",
  },
  {
    q: "What happens if a session is cancelled?",
    a: "Credits are held when you book and only go to the teacher once the session is completed. If a booking is cancelled, the held credits go back to the learner.",
  },
];
