import type { Metadata } from "next";
import { LEGAL } from "../legal-config";

export const metadata: Metadata = {
  title: "Privacy Policy — SkillSwap",
};

export default function PrivacyPage() {
  const { companyName, contactEmail, lastUpdated } = LEGAL;
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>

      <p>
        This policy explains what information {companyName} collects, how we use
        it, and the choices you have.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> name, email address, password (stored securely by our authentication provider, never in plain text), and birthdate if you provide it.</li>
        <li><strong>Profile details:</strong> bio, location, languages, profile picture, and the skills you teach or want to learn.</li>
        <li><strong>Activity:</strong> offerings, time slots, bookings, sessions, credit transactions, reviews, and notifications.</li>
        <li><strong>Messages:</strong> the content of messages you send to other members.</li>
        <li><strong>Technical data:</strong> a cookie that keeps you signed in, and a cookie with your time zone so times display correctly.</li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To run your account and the features you use, like booking, messaging, and credits.</li>
        <li>To show your public profile, offerings, and reviews to other members.</li>
        <li>To send account emails such as sign-up confirmation and password resets.</li>
        <li>To keep the platform safe, prevent fraud and credit abuse, and enforce our terms.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>3. What other members can see</h2>
      <p>
        Your name, profile picture, bio, location, languages, skills, offerings,
        and the reviews you receive are visible to signed-in members. Your email
        address is not shown on your profile. Messages are visible only to the
        people in the conversation.
      </p>

      <h2>4. Service providers</h2>
      <p>
        We use trusted providers to run {companyName}: Supabase (database,
        authentication, and file storage) and Vercel (hosting). They process data
        on our behalf. Your data may be stored on servers outside your country.
      </p>

      <h2>5. How long we keep data</h2>
      <p>
        We keep your information while your account is active. If you delete
        your account we remove your personal details, except where we need to
        keep limited records for legal, security, or fraud-prevention reasons.
      </p>

      <h2>6. Your choices and rights</h2>
      <ul>
        <li>You can edit your profile at any time in Settings.</li>
        <li>You can ask for a copy of your data, a correction, or deletion of your account by emailing <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</li>
      </ul>

      <h2>7. Security</h2>
      <p>
        We use encrypted connections, access controls on every database table,
        and secure password storage. No system is perfectly secure, so please
        use a strong, unique password.
      </p>

      <h2>8. Children</h2>
      <p>
        {companyName} is not intended for anyone under 18, and we don&apos;t
        knowingly collect their information.
      </p>

      <h2>9. Changes and contact</h2>
      <p>
        We may update this policy and will note the date above. Questions or
        requests: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </>
  );
}
