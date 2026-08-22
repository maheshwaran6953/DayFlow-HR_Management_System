import type { EmployeeDocument } from "@/types";

export const DOCUMENTS_SEED: Record<string, EmployeeDocument[]> = {
  "emp-001": [
    { id: "doc-101", name: "Offer Letter.pdf", type: "Offer letter", uploadedAt: "2019-06-01" },
    { id: "doc-102", name: "Aadhaar Card.jpg", type: "ID proof", uploadedAt: "2019-06-08" },
    { id: "doc-103", name: "Degree Certificate.pdf", type: "Education", uploadedAt: "2019-06-09" },
  ],
  "emp-002": [
    { id: "doc-201", name: "Offer Letter.pdf", type: "Offer letter", uploadedAt: "2021-01-20" },
    { id: "doc-202", name: "PAN Card.jpg", type: "ID proof", uploadedAt: "2021-01-25" },
    { id: "doc-203", name: "Relieving Letter.pdf", type: "Previous employer", uploadedAt: "2021-01-28" },
  ],
  "emp-003": [
    { id: "doc-301", name: "Offer Letter.pdf", type: "Offer letter", uploadedAt: "2022-07-30" },
    { id: "doc-302", name: "Passport Copy.pdf", type: "ID proof", uploadedAt: "2022-08-02" },
  ],
  "emp-004": [
    { id: "doc-401", name: "Offer Letter.pdf", type: "Offer letter", uploadedAt: "2026-06-18" },
    { id: "doc-402", name: "Aadhaar Card.pdf", type: "ID proof", uploadedAt: "2026-06-20" },
    { id: "doc-403", name: "BE Transcript.pdf", type: "Education", uploadedAt: "2026-06-21" },
  ],
  "emp-005": [
    { id: "doc-501", name: "Offer Letter.pdf", type: "Offer letter", uploadedAt: "2020-11-10" },
    { id: "doc-502", name: "CA Inter Certificate.pdf", type: "Education", uploadedAt: "2020-11-12" },
  ],
};
