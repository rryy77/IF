import { getTodayDateString } from "./eventUtils";
import {
  deleteAllEvents,
  deleteEventById,
  deleteEventsByIds,
  deletePastEvents,
  fetchConfirmedEvents,
  fetchEventById,
  insertConfirmedEvents,
  updateEventById,
  updateEventDescriptionById,
} from "./supabase/eventsRepository";
import type { EventItem, ExtractionGapWarning } from "./types";

const PENDING_KEY = "latest-if-pending-events";
const WARNINGS_KEY = "latest-if-extraction-warnings";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** 確定予定（Supabase が正） */
export async function getConfirmedEvents(): Promise<EventItem[]> {
  return fetchConfirmedEvents();
}

export async function addConfirmedEvents(events: EventItem[]): Promise<void> {
  await insertConfirmedEvents(events);
  dispatchEventsUpdated();
}

/** 手動で1件追加（source: manual） */
export async function getEventById(id: string): Promise<EventItem | null> {
  return fetchEventById(id);
}

export async function updateConfirmedEvent(event: EventItem): Promise<void> {
  await updateEventById(event);
  dispatchEventsUpdated();
}

export async function updateEventDescription(
  id: string,
  description: string | null
): Promise<void> {
  await updateEventDescriptionById(id, description);
  dispatchEventsUpdated();
}

export async function createManualEvent(event: EventItem): Promise<void> {
  await insertConfirmedEvents([
    {
      ...event,
      status: "confirmed",
      source: "manual",
    },
  ]);
  dispatchEventsUpdated();
}

export async function deleteConfirmedEvent(id: string): Promise<void> {
  await deleteEventById(id);
  dispatchEventsUpdated();
}

export async function deleteAllConfirmedEvents(): Promise<void> {
  await deleteAllEvents();
  dispatchEventsUpdated();
}

export async function deletePastConfirmedEvents(): Promise<void> {
  await deletePastEvents(getTodayDateString());
  dispatchEventsUpdated();
}

export async function deleteConfirmedEventsByIds(
  ids: string[]
): Promise<void> {
  await deleteEventsByIds(ids);
  dispatchEventsUpdated();
}

function dispatchEventsUpdated(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event("latest-if-events-updated"));
  }
}

// --- 仮予定は引き続き sessionStorage ---

export function getPendingEvents(): EventItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EventItem[];
  } catch {
    return [];
  }
}

export function savePendingEvents(events: EventItem[]): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(events));
}

export function clearPendingEvents(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(PENDING_KEY);
  sessionStorage.removeItem(WARNINGS_KEY);
}

export function saveExtractionWarnings(
  warnings: ExtractionGapWarning[]
): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(WARNINGS_KEY, JSON.stringify(warnings));
}

export function getExtractionWarnings(): ExtractionGapWarning[] {
  if (!isBrowser()) return [];
  try {
    const raw = sessionStorage.getItem(WARNINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExtractionGapWarning[];
  } catch {
    return [];
  }
}
