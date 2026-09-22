import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

// "My profile" simply shows the public profile view for the current user.
export default async function MyProfilePage() {
  const { user } = await requireUser();
  redirect(`/u/${user.id}`);
}
