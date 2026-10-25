import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/admin/ui";
import { announcementIsLive, listAnnouncements } from "@/lib/admin/announcements";
import { AnnouncementForm } from "./AnnouncementForm";
import { AnnouncementRow } from "./AnnouncementRow";

export const metadata = { title: "Announcements" };

export default async function AdminAnnouncementsPage() {
  const announcements = await listAnnouncements();

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" description="A banner shown to every signed-in member while it is live. Members can dismiss it." />

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-gray-900">New announcement</h2>
        <AnnouncementForm />
      </Card>

      {announcements.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-500">No announcements yet.</Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementRow key={a.id} a={a} live={announcementIsLive(a)} />
          ))}
        </div>
      )}
    </div>
  );
}
