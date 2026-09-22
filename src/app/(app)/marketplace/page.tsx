import { Card } from "@/components/ui/Card";
import { OfferingCard } from "@/components/OfferingCard";
import { requireUser } from "@/lib/auth";
import { searchOfferings, getCategories } from "@/lib/data";
import { SearchBar } from "./SearchBar";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { user } = await requireUser();
  const { q, category } = await searchParams;

  const [categories, offerings] = await Promise.all([
    getCategories(),
    searchOfferings({ userId: user.id, q, category }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explore skills</h1>
        <p className="mt-1 text-slate-600">
          Find someone to learn from and book a session with your credits.
        </p>
      </div>

      <SearchBar categories={categories} />

      <p className="text-sm text-slate-500">
        {offerings.length} {offerings.length === 1 ? "result" : "results"}
        {category && category !== "All" ? ` in ${category}` : ""}
        {q ? ` for “${q}”` : ""}
      </p>

      {offerings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((o) => (
            <OfferingCard key={o.id} offering={o} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-slate-600">No skills match your search yet.</p>
          <p className="mt-1 text-sm text-slate-400">
            Try a different keyword or category — or be the first to offer this
            skill.
          </p>
        </Card>
      )}
    </div>
  );
}
