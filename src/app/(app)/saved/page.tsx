import { Bookmark } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OfferingCard } from "@/components/OfferingCard";
import { requireUser } from "@/lib/auth";
import { getSavedOfferings } from "@/lib/favorites";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  const { user } = await requireUser();
  const offerings = await getSavedOfferings(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Saved offerings</h1>
        <p className="mt-1 text-gray-600">
          Offerings you bookmarked to come back to. {offerings.length} saved.
        </p>
      </div>

      {offerings.length === 0 ? (
        <Card className="flex flex-col items-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <Bookmark className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium text-gray-900">Nothing saved yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Tap the bookmark on any offering in the marketplace to keep it here.
          </p>
          <Button href="/marketplace" variant="brand" className="mt-4">Explore the marketplace</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {offerings.map((o) => (
            <OfferingCard key={o.id} offering={o} saved />
          ))}
        </div>
      )}
    </div>
  );
}
