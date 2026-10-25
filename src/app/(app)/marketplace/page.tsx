import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OfferingCard } from "@/components/OfferingCard";
import { TeacherCard } from "@/components/TeacherCard";
import { requireUser } from "@/lib/auth";
import { searchOfferings, getCategories, searchTeachers, type OfferingSort } from "@/lib/data";
import { getSavedOfferingIds } from "@/lib/favorites";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    view?: string;
    level?: string;
    mode?: string;
    max?: string;
    sort?: string;
  }>;
}) {
  const { user } = await requireUser();
  const { q, category, view, level, mode, max, sort } = await searchParams;
  const isPeople = view === "people";
  const maxCost = max !== undefined && max !== "" ? Number(max) : undefined;

  const [categories, offerings, teachers, savedIds] = await Promise.all([
    getCategories(),
    isPeople
      ? Promise.resolve([])
      : searchOfferings({
          userId: user.id,
          q,
          category,
          level,
          mode,
          maxCost,
          sort: (sort as OfferingSort | undefined) ?? "newest",
        }),
    isPeople ? searchTeachers({ userId: user.id, q }) : Promise.resolve([]),
    getSavedOfferingIds(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Explore</h1>
        <p className="mt-1 text-gray-600">
          {isPeople
            ? "Discover people who teach — reach out and set up a swap."
            : "Find someone to learn from and book a session with your credits."}
        </p>
      </div>

      <SearchBar categories={categories} />
      {!isPeople && <FilterBar />}

      {isPeople ? (
        <>
          <p className="text-sm text-gray-500">
            {teachers.length} {teachers.length === 1 ? "person" : "people"}
            {q ? ` for “${q}”` : ""}
          </p>
          {teachers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {teachers.map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-gray-600">No people match your search yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                Try a different name or skill.
              </p>
            </Card>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {offerings.length} {offerings.length === 1 ? "result" : "results"}
            {category && category !== "All" ? ` in ${category}` : ""}
            {q ? ` for “${q}”` : ""}
          </p>
          {offerings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {offerings.map((o) => (
                <OfferingCard key={o.id} offering={o} saved={savedIds.has(o.id)} />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-gray-600">No offerings match your search yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                Try removing a filter, or find people who teach it.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href={`/marketplace?view=people${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  Browse People →
                </Link>
                <Link
                  href="/offer"
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  Offer this skill yourself
                </Link>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export const metadata = { title: "Explore" };
