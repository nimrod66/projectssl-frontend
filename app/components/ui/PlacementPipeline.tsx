"use client";

import { SkeletonCard } from "@/app/components/ui/Skeleton";

interface Props {
  stages: { label: string; key: string }[];
  currentStage: string;
}

const groupLabels: Record<string, string> = {
  ASSIGNED: "Assignment", ACCEPTED: "Assignment",
  DOCUMENTS_SUBMITTED: "Documentation", DOCUMENTS_VERIFIED: "Documentation", MEDICAL_DONE: "Documentation",
  CONTRACT_SIGNED: "Contract", VISA_APPLIED: "Contract", VISA_APPROVED: "Contract",
  FLIGHT_BOOKED: "Departure", PRE_DEPARTURE: "Departure", DEPARTED: "Departure",
  DEPLOYED: "Deployment",
  RENEWED: "Complete", COMPLETED: "Complete", RETURNED: "Complete",
  DECLINED: "Stopped", TERMINATED: "Stopped",
};

const allStages = [
  "ASSIGNED", "ACCEPTED", "DOCUMENTS_SUBMITTED", "DOCUMENTS_VERIFIED", "MEDICAL_DONE",
  "CONTRACT_SIGNED", "VISA_APPLIED", "VISA_APPROVED",
  "FLIGHT_BOOKED", "PRE_DEPARTURE", "DEPARTED", "DEPLOYED",
  "RENEWED", "COMPLETED", "RETURNED", "DECLINED", "TERMINATED",
];

const shortLabels: Record<string, string> = {
  ASSIGNED: "Assigned", ACCEPTED: "Accepted", DOCUMENTS_SUBMITTED: "Docs In", DOCUMENTS_VERIFIED: "Verified",
  MEDICAL_DONE: "Medical", CONTRACT_SIGNED: "Signed", VISA_APPLIED: "Visa App", VISA_APPROVED: "Visa OK",
  FLIGHT_BOOKED: "Flight", PRE_DEPARTURE: "Briefing", DEPARTED: "Departed", DEPLOYED: "Deployed",
  RENEWED: "Renewed", COMPLETED: "Done", RETURNED: "Returned", DECLINED: "No", TERMINATED: "End",
};

export default function PlacementPipeline({ currentStage }: { currentStage: string }) {
  const currentIdx = allStages.indexOf(currentStage);
  const isTerminal = ["DECLINED", "TERMINATED", "COMPLETED", "RETURNED"].includes(currentStage);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {allStages.filter(s => !["DECLINED", "TERMINATED", "RENEWED", "COMPLETED", "RETURNED"].includes(s)).map((stage, i) => {
          const idx = allStages.indexOf(stage);
          const isComplete = idx <= currentIdx && currentStage !== "DECLINED" && currentStage !== "TERMINATED";
          const isCurrent = stage === currentStage;

          let bg = "bg-gray-100";
          if (isCurrent && !isTerminal) bg = "bg-indigo-100 border-indigo-400";
          else if (isComplete) bg = "bg-green-50 border-green-300";
          if (currentStage === "DECLINED") bg = "bg-red-50 border-red-300";
          if (currentStage === "TERMINATED") bg = "bg-red-50 border-red-300";

          return (
            <div key={stage} className={`flex-1 min-w-[48px] rounded-lg border-2 text-center py-2 px-1 transition ${bg}`}>
              <p className="text-[10px] font-bold text-gray-600 whitespace-nowrap">{shortLabels[stage] || stage}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
