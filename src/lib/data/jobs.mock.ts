// Mock job/internship postings for the MVP (replace with real feed later).

export interface MockJob {
  id: string;
  title: string;
  company: string;
  location: string;
  roleSlug: string;
  isInternship: boolean;
  requiredSkills: string[];
}

export const MOCK_JOBS: MockJob[] = [
  {
    id: "job-1",
    title: "Junior Data Analyst",
    company: "IT Park Uzbekistan",
    location: "Tashkent",
    roleSlug: "data-analyst",
    isInternship: false,
    requiredSkills: ["SQL", "Power BI", "Excel"],
  },
  {
    id: "job-2",
    title: "Data Analyst Intern",
    company: "Uzum",
    location: "Tashkent",
    roleSlug: "data-analyst",
    isInternship: true,
    requiredSkills: ["SQL", "Excel"],
  },
  {
    id: "job-3",
    title: "Frontend Developer",
    company: "EPAM Uzbekistan",
    location: "Tashkent",
    roleSlug: "frontend-dev",
    isInternship: false,
    requiredSkills: ["JavaScript", "React"],
  },
  {
    id: "job-4",
    title: "ML Intern",
    company: "MyTaxi",
    location: "Tashkent",
    roleSlug: "ml-engineer",
    isInternship: true,
    requiredSkills: ["Python", "Statistics"],
  },
];
