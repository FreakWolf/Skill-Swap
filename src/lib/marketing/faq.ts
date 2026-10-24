// Single source for FAQ content. The /faq page renders every group; the
// pricing page reuses the "Credits & pricing" group.
export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "credits",
    title: "Credits & pricing",
    items: [
      {
        q: "What is a credit?",
        a: "One credit is one hour of someone's time. You spend credits to book a session and earn credits when you teach one. The whole exchange runs on time, not money.",
      },
      {
        q: "Do I need to pay to join?",
        a: "No. Every new member starts with 3 free credits, enough to book your first sessions and see how it works. Teaching is the main way to earn more.",
      },
      {
        q: "Can I buy credits instead of teaching?",
        a: "Yes. If you want to learn faster than you teach, you can buy a credit pack from the Credits page. Packs are priced in rupees and bigger packs cost less per credit.",
      },
      {
        q: "Do credits expire?",
        a: "No. Credits stay in your account until you spend them.",
      },
      {
        q: "Can I cash out credits?",
        a: "No. Credits are not money and cannot be withdrawn or transferred to another member. They can only be spent on sessions.",
      },
    ],
  },
  {
    id: "booking",
    title: "Booking & sessions",
    items: [
      {
        q: "How do I book a session?",
        a: "Open an offering in the marketplace, pick one of the teacher's open time slots and confirm. The credit cost is held from your balance the moment you book.",
      },
      {
        q: "Where does the session happen?",
        a: "Virtual sessions use whatever video tool you and the teacher agree on in Messages. In-person offerings list a location on the offering page.",
      },
      {
        q: "Who marks a session complete?",
        a: "The learner can mark it complete once the session has started. If the learner forgets, the teacher can claim it 48 hours after the scheduled end. Completion releases the held credits to the teacher.",
      },
      {
        q: "Can I leave a review?",
        a: "Yes. After a session is completed, both people can rate each other from one to five stars and leave a short comment. Reviews build your reputation on the marketplace.",
      },
    ],
  },
  {
    id: "cancellations",
    title: "Cancellations & refunds",
    items: [
      {
        q: "What if I need to cancel?",
        a: "Either person can cancel a session any time before it starts. The held credits go straight back to the learner and the slot opens up again.",
      },
      {
        q: "What if the teacher does not show up?",
        a: "Do not mark the session complete. Use the Report a problem button on the session page, choose No-show, and the team will review it.",
      },
      {
        q: "Are credit purchases refundable?",
        a: "Purchases are final once credits are added to your account. If a payment fails or is charged twice, contact us with the payment ID and we will sort it out.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & trust",
    items: [
      {
        q: "How do you keep the community safe?",
        a: "Every member has a public profile with reviews, you can block anyone at any time, and every page has a Report button. Blocked members cannot message or book you.",
      },
      {
        q: "What happens when I report someone?",
        a: "The report goes to our moderation queue. We review it, may contact either party, and can suspend accounts that break the community rules.",
      },
      {
        q: "Who can see my profile?",
        a: "Only signed-in members. Your name, bio, skills, offerings and reviews are visible to them. Your email and payment details are never shown.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    items: [
      {
        q: "How are payments processed?",
        a: "Credit purchases are handled by Razorpay. We never see or store your card details. Each purchase and the credits it added appear in your purchase history.",
      },
      {
        q: "Will I get an invoice?",
        a: "Razorpay emails a receipt for every successful payment. Your purchase history on the Credits page lists the payment ID for reference.",
      },
    ],
  },
];
