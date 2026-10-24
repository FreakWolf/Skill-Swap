import { Card, Badge } from "@/components/ui/Card";
import { DataTable, PageHeader, SearchForm } from "@/components/admin/ui";
import { listSkillCategories, listSkills, type AdminSkill } from "@/lib/admin/skills";
import { param, type SearchParams } from "@/lib/admin/shared";
import { NewSkillForm, SkillRowActions } from "./SkillForms";

export const metadata = { title: "Skills" };

export default async function AdminSkillsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = param(sp, "q");
  const [skills, categories] = await Promise.all([listSkills(q), listSkillCategories()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Skills" description={`${skills.length} skill${skills.length === 1 ? "" : "s"} in the catalogue. Members can add custom ones; promote the good ones.`}>
        <SearchForm placeholder="Search skills" defaultValue={q} />
      </PageHeader>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-gray-900">Add a skill</h2>
        <NewSkillForm categories={categories} />
      </Card>

      <DataTable<AdminSkill>
        rows={skills}
        empty="No skills match."
        columns={[
          {
            key: "name",
            header: "Skill",
            render: (s) => (
              <span className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{s.name}</span>
                {s.is_custom && <Badge>member-added</Badge>}
              </span>
            ),
          },
          { key: "category", header: "Category", render: (s) => s.category },
          { key: "offerings", header: "Offerings", className: "text-right", render: (s) => s.offeringCount },
          { key: "members", header: "Members", className: "text-right", render: (s) => s.memberCount },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (s) => (
              <SkillRowActions
                id={s.id}
                name={s.name}
                category={s.category}
                isCustom={s.is_custom}
                inUse={s.offeringCount + s.memberCount > 0}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
