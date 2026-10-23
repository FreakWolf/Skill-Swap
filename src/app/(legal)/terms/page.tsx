import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "../legal-config";

export const metadata: Metadata = {
  title: "Terms of Service — SkillSwap",
};

export default function TermsPage() {
  const { companyName, contactEmail, jurisdiction, lastUpdated, minimumAge } = LEGAL;
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>

      <p>
        These terms govern your use of {companyName}, a community where members
        teach skills to earn credits and spend credits to learn from others. By
        creating an account you agree to these terms and to our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. Eligibility and accounts</h2>
      <ul>
        <li>You must be at least {minimumAge} years old to use {companyName}.</li>
        <li>Provide accurate information and keep your login details secure. You are responsible for activity on your account.</li>
        <li>One person, one account. Creating extra accounts to collect starter credits is not allowed.</li>
      </ul>

      <h2>2. Credits</h2>
      <ul>
        <li>Credits are an in-app unit used to book sessions. One credit represents one hour of a session unless the teacher sets a different price.</li>
        <li>Credits have no cash value, cannot be withdrawn or exchanged for money, and cannot be transferred outside the platform.</li>
        <li>When you book, the session&apos;s credits are held. They move to the teacher when the learner confirms the session happened, or when the teacher claims them 48 hours after the session ends if the learner hasn&apos;t responded.</li>
        <li>Cancelling before a session starts refunds the held credits to the learner. Sessions can&apos;t be cancelled after they start.</li>
        <li>We may correct balances affected by errors, fraud, or abuse, and may remove credits obtained in breach of these terms.</li>
      </ul>

      <h2>3. Sessions and conduct</h2>
      <ul>
        <li>Teachers and learners arrange sessions directly with each other. {companyName} is a platform that connects members and does not employ teachers or guarantee the quality of any session.</li>
        <li>Only confirm a session if it actually took place.</li>
        <li>Be respectful. Harassment, hate speech, threats, sexual content, spam, scams, and illegal activity are prohibited.</li>
        <li>Take care when meeting in person. Meet in public places and tell someone where you&apos;ll be.</li>
        <li>Don&apos;t share content you don&apos;t have the right to share.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You keep ownership of what you post (profile details, offerings,
        messages, reviews). You give {companyName} permission to store and
        display it as needed to run the service. Reviews must be honest and
        based on a real session.
      </p>

      <h2>5. Suspension and termination</h2>
      <p>
        We may suspend or close accounts that break these terms or put other
        members at risk. You can stop using {companyName} at any time and ask us
        to delete your account by emailing <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2>6. Disclaimers and liability</h2>
      <p>
        {companyName} is provided &ldquo;as is&rdquo; without warranties of any
        kind. To the extent permitted by law, we are not liable for indirect or
        consequential losses, or for the conduct of members on or off the
        platform.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms. If changes are significant we&apos;ll let you
        know in the app. Continuing to use {companyName} after changes means you
        accept them.
      </p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of {jurisdiction}.</p>

      <h2>9. Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </>
  );
}
