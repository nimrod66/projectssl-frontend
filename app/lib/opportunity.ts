export interface Opportunity {
  id: number;
  title: string;
  description?: string;
  country: string;
  location?: string;
  jobCategory?: string;
  numberOfPositions: number;
  filledPositions: number;
  salaryMinimum?: number;
  salaryMaximum?: number;
  currency?: string;
  durationMonths?: number;
  startDate?: string;
  benefits?: string;
  termsAndConditions?: string;
  workingHours?: string;
  accommodationProvided?: boolean;
  transportProvided?: boolean;
  requiredExperience?: string;
  requiredEducation?: string;
  requiredSkills?: string;
  requiredLanguages?: string;
  minimumAge?: number;
  maximumAge?: number;
  genderRequirement?: "MALE" | "FEMALE" | "OTHER" | null;
  applicationDeadline?: string;
  status: string;
  employerId?: number;
  employerName?: string;
  contractId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export function formatSalary(o: Opportunity): string {
  if (o.salaryMinimum == null && o.salaryMaximum == null) return "Salary on application";
  const cur = o.currency || "USD";
  const fmt = (n: number) => new Intl.NumberFormat("en-KE").format(n);
  if (o.salaryMaximum != null && o.salaryMinimum != null) {
    return `${cur} ${fmt(o.salaryMinimum)} – ${fmt(o.salaryMaximum)}`;
  }
  return `${cur} ${fmt((o.salaryMinimum ?? o.salaryMaximum)!)}+`;
}

export function positionsLeft(o: Opportunity): number {
  return Math.max(0, o.numberOfPositions - o.filledPositions);
}

export function deadlineLabel(deadline?: string): string {
  if (!deadline) return "";
  const d = new Date(deadline + "T23:59:59");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "Applications closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

export function expired(deadline?: string): boolean {
  if (!deadline) return false;
  return new Date(deadline + "T23:59:59").getTime() < Date.now();
}