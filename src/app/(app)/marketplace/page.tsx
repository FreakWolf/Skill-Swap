import Link from "next/link";
import { Search, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore</h1>
        <p className="mt-1 text-muted">
          {isPeople
            ? "Discover people who teach — reach out and set up a swap."
            : "Find someone to learn from and book a session with your credits."}
        </p>
      </div>

      <SearchBar categories={categories} />

      {isPeople ? (
        <>
          <p className="text-sm text-muted">
            {teachers.length} {teachers.length === 1 ? "person" : "people"}
            {q ? ` for “${q}”` : ""}
          </p>
          {teachers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((t, i) => (
                <Reveal key={t.id} delay={i}>
                  <TeacherCard teacher={t} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="No people match your search yet">
              Try a different name or skill.
            </EmptyState>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted">
            {offerings.length} {offerings.length === 1 ? "result" : "results"}
            {category && category !== "All" ? ` in ${category}` : ""}
            {q ? ` for “${q}”` : ""}
          </p>
          {offerings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((o, i) => (
                <Reveal key={o.id} delay={i}>
                  <OfferingCard offering={o} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={Search} title="No offerings match your search yet">
              <p>
                Nobody has published this skill yet — but you can still find
                people who teach it.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link
                  href={`/marketplace?view=people${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="text-sm font-semibold text-link hover:underline"
                >
                  Browse People →
                </Link>
                <Link
                  href="/offer"
                  className="text-sm font-semibold text-link hover:underline"
                >
                  Offer this skill yourself
                </Link>
              </div>
            </EmptyState>
          )}
        </>
      )}
    </div>
  );
}

export const metadata = { title: "Explore" };
