import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OfferingCard } from "@/components/OfferingCard";
import { TeacherCard } from "@/components/TeacherCard";
import { requireUser } from "@/lib/auth";
import { searchOfferings, getCategories, searchTeachers } from "@/lib/data";
import { SearchBar } from "./SearchBar";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; view?: string }>;
}) {
  const { user } = await requireUser();
  const { q, category, view } = await searchParams;
  const isPeople = view === "people";

  const [categories, offerings, teachers] = await Promise.all([
    getCategories(),
    isPeople
      ? Promise.resolve([])
      : searchOfferings({ userId: user.id, q, category }),
    isPeople ? searchTeachers({ userId: user.id, q }) : Promise.resolve([]),
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

      {isPeople ? (
        <>
          <p className="text-sm text-gray-500">
            {teachers.length} {teachers.length === 1 ? "person" : "people"}
            {q ? ` for “${q}”` : ""}
          </p>
          {teachers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-gray-600">No people match your search yet.</p>
              <p className="mt-1 text-sm text-gray-400">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((o) => (
                <OfferingCard key={o.id} offering={o} />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <p className="text-gray-600">No offerings match your search yet.</p>
              <p className="mt-1 text-sm text-gray-400">
                Nobody has published this skill yet — but you can still find
                people who teach it.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href={`/marketplace?view=people${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Browse People →
                </Link>
                <Link
                  href="/offer"
                  className="text-sm font-medium text-blue-600 hover:underline"
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
