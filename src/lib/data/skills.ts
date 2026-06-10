// Skill taxonomy + role→skill weights. Mirrors supabase seed data so the
// scaffold's services work even before the DB is wired up.

export interface RoleDefinition {
  slug: string;
  title: string;
  skills: { name: string; weight: number }[];
}

export const ROLES: RoleDefinition[] = [
  {
    slug: "data-analyst",
    title: "Data Analyst",
    skills: [
      { name: "SQL", weight: 3 },
      { name: "Power BI", weight: 3 },
      { name: "Statistics", weight: 2 },
      { name: "Excel", weight: 1 },
    ],
  },
  {
    slug: "frontend-dev",
    title: "Frontend Developer",
    skills: [
      { name: "JavaScript", weight: 3 },
      { name: "React", weight: 3 },
      { name: "CSS", weight: 1 },
    ],
  },
  {
    slug: "ml-engineer",
    title: "ML Engineer",
    skills: [
      { name: "Python", weight: 3 },
      { name: "Machine Learning", weight: 3 },
      { name: "Statistics", weight: 2 },
    ],
  },
];

export function findRoleByTitle(title: string): RoleDefinition | undefined {
  const t = title.toLowerCase().trim();
  return ROLES.find(
    (r) => r.title.toLowerCase() === t || r.slug === t.replace(/\s+/g, "-"),
  );
}

export const ROLE_TITLES = ROLES.map((r) => r.title);
