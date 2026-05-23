export type EventItem = {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  endDate?: string;
  type: "school" | "test" | "event" | "holiday" | "other";
  status: "pending" | "confirmed";
  source: "pdf" | "manual";
  confidence?: number;
  rawText?: string;
  description?: string;
};

export type ExtractionGapWarning = {
  fromDate: string;
  toDate: string;
  gapDays: number;
  message: string;
};
