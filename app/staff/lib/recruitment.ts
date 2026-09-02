export interface Applicant {
  id: number;
  applicantNumber: string;
  applicantType: "LOCAL" | "INTERNATIONAL";
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  alternativePhone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  nationality?: string;
  county?: string;
  address?: string;
  registrationSource?: string;
  lifecycleStage: LifecycleStage;
  status: string;
  assignedRecruiterId?: number;
  assignedRecruiterName?: string;
  createdAt?: string;
  profile?: ApplicantProfile;
}

export interface ApplicantProfile {
  educationLevel?: string;
  fieldOfStudy?: string;
  professionalSummary?: string;
  yearsOfExperience?: number;
  skills?: string;
  languages?: string;
  preferredJobCategories?: string;
  preferredCountries?: string;
  preferredSalary?: number;
  preferredSalaryCurrency?: string;
  availability?: string;
  availableFrom?: string;
  willingToRelocate?: boolean;
  employmentStatus?: string;
  currentEmployer?: string;
  currentPosition?: string;
  relevantExperience?: string;
  reasonForLeaving?: string;
  religion?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
}

export type LifecycleStage =
  | "REGISTERED" | "PROFILE_COMPLETE" | "UNDER_REVIEW" | "VETTED" | "ELIGIBLE" | "INACTIVE" | "BLACKLISTED";

export interface RecruitmentApplication {
  id: number;
  applicantId: number;
  applicantName: string;
  applicantNumber: string;
  opportunityId: number;
  opportunityTitle: string;
  assignedRecruiterId?: number;
  assignedRecruiterName?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  rejectionDetails?: string;
  appliedAt?: string;
  lastActivityAt?: string;
  createdAt?: string;
  interviewCount: number;
  offerCount: number;
}

export type ApplicationStatus =
  | "SUBMITTED" | "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "ACCEPTED" | "PLACED" | "REJECTED" | "WITHDRAWN";

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
  status: OpportunityStatus;
  employerId: number;
  employerName: string;
  contractId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OpportunityStatus = "DRAFT" | "PENDING_APPROVAL" | "OPEN" | "PAUSED" | "FILLED" | "CLOSED";

export interface PlacementChecklistItem {
  id: number;
  item: CheckItem;
  required: boolean;
  completed: boolean;
  completedAt?: string;
  completedByName?: string;
  notes?: string;
}

export type CheckItem =
  | "PASSPORT" | "MEDICAL" | "VISA" | "SIGNED_CONTRACT" | "FLIGHT_BOOKING"
  | "EMPLOYER_CONFIRMATION" | "CANDIDATE_BRIEFING" | "EMERGENCY_CONTACT";

export interface PlacementHistoryEntry {
  id: number;
  fromStage?: string;
  toStage: string;
  reason?: string;
  actorName?: string;
  createdAt?: string;
}

export interface Placement {
  id: number;
  placementNumber: string;
  applicantId: number;
  applicantName: string;
  applicantNumber: string;
  applicationId: number;
  acceptedOfferId: number;
  opportunityId: number;
  opportunityTitle: string;
  employerId: number;
  employerName: string;
  contractId: number;
  stage: PlacementStage;
  active: boolean;
  startDate?: string;
  expectedEndDate?: string;
  terminationReason?: string;
  returnReason?: string;
  createdAt?: string;
  history: PlacementHistoryEntry[];
  checklist: PlacementChecklistItem[];
}

export type PlacementStage =
  | "CREATED" | "DOCUMENTATION" | "MEDICAL" | "VISA" | "CONTRACT_SIGNED"
  | "TRAVEL_READY" | "DEPLOYED" | "COMPLETED" | "TERMINATED" | "RETURNED";

export interface Consent {
  id: number;
  consentType: string;
  status: string;
  signedAt?: string;
  revokedAt?: string;
  termsVersion?: string;
  source?: string;
  grantedByName?: string;
}

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  requiresVerification: boolean;
  category: string;
}

export interface ApplicantDocument {
  id: number;
  applicantId: number;
  documentType: DocumentType;
  fileUrl?: string | null;
  originalName?: string | null;
  status: string;
  version: number;
  current: boolean;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  uploadedAt?: string;
}

export const documentStatusLabels: Record<string, string> = {
  NOT_SUBMITTED: "Not submitted",
  UPLOADED: "Uploaded",
  UNDER_REVIEW: "Under review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  RESUBMISSION_REQUIRED: "Resubmission required",
  EXPIRED: "Expired",
};

export const documentStatusTone: Record<string, string> = {
  UPLOADED: "bg-slate-100 text-slate-600",
  UNDER_REVIEW: "bg-blue-50 text-blue-600",
  VERIFIED: "bg-emerald-50 text-emerald-600",
  REJECTED: "bg-red-50 text-red-600",
  RESUBMISSION_REQUIRED: "bg-amber-50 text-amber-600",
  EXPIRED: "bg-slate-100 text-slate-500",
  NOT_SUBMITTED: "bg-slate-100 text-slate-500",
};

export interface DocumentRequirement {
  id: number;
  documentType: DocumentType;
  applicantType: string;
  opportunityId?: number | null;
  required: boolean;
}

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface CampaignMember {
  id: number;
  applicantId: number;
  applicantName: string;
  applicantNumber: string;
  addedAt: string;
}

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  targetApplicantType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdById?: number | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt?: string;
  members: CampaignMember[];
}

export const campaignStatusLabels: Record<string, string> = {
  DRAFT: "Draft", ACTIVE: "Active", PAUSED: "Paused", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

export const campaignStatusTone: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-emerald-50 text-emerald-600",
  PAUSED: "bg-amber-50 text-amber-600",
  COMPLETED: "bg-sky-50 text-sky-600",
  CANCELLED: "bg-red-50 text-red-600",
};

export const CAMPAIGN_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["PAUSED", "COMPLETED", "CANCELLED"],
  PAUSED: ["ACTIVE", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export interface RecruitmentTask {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedToId?: number | null;
  assignedToName?: string | null;
  relatedApplicantId?: number | null;
  relatedOpportunityId?: number | null;
  entityType?: string;
  entityId?: number | null;
  dueDate?: string | null;
  createdById?: number;
  createdByName?: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const taskStatusLabels: Record<string, string> = {
  OPEN: "Open", IN_PROGRESS: "In progress", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

export const taskStatusTone: Record<string, string> = {
  OPEN: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-sky-50 text-sky-600",
  COMPLETED: "bg-emerald-50 text-emerald-600",
  CANCELLED: "bg-red-50 text-red-600",
};

export const taskPriorityLabels: Record<string, string> = {
  LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent",
};

export const taskPriorityTone: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-500",
  MEDIUM: "bg-sky-50 text-sky-600",
  HIGH: "bg-amber-50 text-amber-600",
  URGENT: "bg-red-50 text-red-600",
};

export type InterviewType = "SSL_SCREENING" | "EMPLOYER_INTERVIEW";
export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED" | "RESCHEDULED";
export type InterviewOutcome = "PASS" | "FAIL" | "PENDING" | "NO_DECISION";

export interface Interview {
  id: number;
  applicationId: number;
  type: InterviewType;
  scheduledAt?: string;
  interviewerId?: number;
  interviewerName?: string;
  location?: string;
  meetingLink?: string;
  status: InterviewStatus;
  outcome?: InterviewOutcome;
  rating?: number;
  notes?: string;
}

export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";

export interface Offer {
  id: number;
  applicationId: number;
  applicantId: number;
  applicantName: string;
  opportunityTitle: string;
  offeredSalary?: number;
  currency?: string;
  positionTitle?: string;
  startDate?: string;
  benefits?: string;
  conditions?: string;
  status: OfferStatus;
  rejectionReason?: string;
  offeredAt?: string;
  respondedAt?: string;
  expiresAt?: string;
}

export interface ReadinessResult {
  ready: boolean;
  explanations: string[];
}

export interface StaffMember {
  id: number;
  fullName: string;
  role: string;
}

export const lifecycleLabels: Record<LifecycleStage, string> = {
  REGISTERED: "Registered", PROFILE_COMPLETE: "Profile Complete", UNDER_REVIEW: "Under Review",
  VETTED: "Vetted", ELIGIBLE: "Eligible", INACTIVE: "Inactive", BLACKLISTED: "Blacklisted",
};

export const lifecycleOrder: LifecycleStage[] = [
  "REGISTERED", "PROFILE_COMPLETE", "UNDER_REVIEW", "VETTED", "ELIGIBLE", "INACTIVE", "BLACKLISTED",
];

export const applicationLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted", SCREENING: "Screening", SHORTLISTED: "Shortlisted", INTERVIEW: "Interview",
  OFFERED: "Offered", ACCEPTED: "Accepted", PLACED: "Placed", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

export const rejectionLabels: Record<string, string> = {
  MISSING_QUALIFICATION: "Missing qualification", FAILED_SCREENING: "Failed screening",
  FAILED_INTERVIEW: "Failed interview", EMPLOYER_REJECTION: "Employer rejection",
  DOCUMENTS_INVALID: "Invalid documents", SALARY_MISMATCH: "Salary mismatch",
  POSITION_FILLED: "Position filled", CANDIDATE_WITHDREW: "Candidate withdrew", OTHER: "Other",
};

export const opportunityLabels: Record<OpportunityStatus, string> = {
  DRAFT: "Draft", PENDING_APPROVAL: "Pending approval", OPEN: "Open", PAUSED: "Paused",
  FILLED: "Filled", CLOSED: "Closed",
};

export const placementStageLabels: Record<PlacementStage, string> = {
  CREATED: "Created", DOCUMENTATION: "Documentation", MEDICAL: "Medical", VISA: "Visa",
  CONTRACT_SIGNED: "Contract signed", TRAVEL_READY: "Travel ready", DEPLOYED: "Deployed",
  COMPLETED: "Completed", TERMINATED: "Terminated", RETURNED: "Returned",
};

export const checkItemLabels: Record<CheckItem, string> = {
  PASSPORT: "Passport", MEDICAL: "Medical clearance", VISA: "Visa", SIGNED_CONTRACT: "Signed contract",
  FLIGHT_BOOKING: "Flight booking", EMPLOYER_CONFIRMATION: "Employer confirmation",
  CANDIDATE_BRIEFING: "Candidate briefing", EMERGENCY_CONTACT: "Emergency contact",
};

export const checkItemOrder: CheckItem[] = [
  "PASSPORT", "MEDICAL", "VISA", "SIGNED_CONTRACT", "FLIGHT_BOOKING",
  "EMPLOYER_CONFIRMATION", "CANDIDATE_BRIEFING", "EMERGENCY_CONTACT",
];

export function fmtDate(v?: string): string {
  if (!v) return "—";
  const withT = v.length === 10 ? v + "T00:00:00" : v;
  return new Date(withT).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(v?: string): string {
  return v ? new Date(v).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
}

export function ageFrom(dob?: string): number | null {
  if (!dob) return null;
  const born = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--;
  return age;
}

export const interviewStatusLabels: Record<InterviewStatus, string> = {
  SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled", MISSED: "Missed", RESCHEDULED: "Rescheduled",
};

export const interviewTypeLabels: Record<InterviewType, string> = {
  SSL_SCREENING: "SSL Screening", EMPLOYER_INTERVIEW: "Employer interview",
};

export const interviewOutcomeLabels: Record<InterviewOutcome, string> = {
  PASS: "Pass", FAIL: "Fail", PENDING: "Pending", NO_DECISION: "No decision",
};

export const offerStatusLabels: Record<OfferStatus, string> = {
  PENDING: "Pending", ACCEPTED: "Accepted", REJECTED: "Rejected", WITHDRAWN: "Withdrawn", EXPIRED: "Expired",
};

export function toLocalDateTimeLocal(v?: string): string {
  return v ? v.slice(0, 16) : "";
}