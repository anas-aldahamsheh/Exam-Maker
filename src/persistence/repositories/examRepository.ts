import { getExamDatabase, CompletedAttemptRecord } from "../indexeddb/database";
import { ExamAttempt, ExamResult } from "@/types/exam";

export async function saveActiveAttempt(attempt: ExamAttempt): Promise<void> {
  try {
    const db = await getExamDatabase();
    await db.put("activeAttempts", attempt);
  } catch (err) {
    console.error("Failed to save active attempt to IndexedDB:", err);
  }
}

export async function getActiveAttempt(
  id: string
): Promise<ExamAttempt | undefined> {
  try {
    const db = await getExamDatabase();
    return await db.get("activeAttempts", id);
  } catch (err) {
    console.error("Failed to retrieve active attempt from IndexedDB:", err);
    return undefined;
  }
}

export async function deleteActiveAttempt(id: string): Promise<void> {
  try {
    const db = await getExamDatabase();
    await db.delete("activeAttempts", id);
  } catch (err) {
    console.error("Failed to delete active attempt from IndexedDB:", err);
  }
}

export async function saveCompletedAttempt(
  attempt: ExamAttempt,
  result: ExamResult
): Promise<void> {
  try {
    const db = await getExamDatabase();
    const record: CompletedAttemptRecord = {
      id: attempt.id,
      attempt,
      result,
      completedAt: new Date().toISOString(),
    };
    await db.put("completedAttempts", record);
    // Remove from active store once completed
    await db.delete("activeAttempts", attempt.id);
  } catch (err) {
    console.error("Failed to save completed attempt to IndexedDB:", err);
  }
}

export async function getCompletedAttempt(
  id: string
): Promise<CompletedAttemptRecord | undefined> {
  try {
    const db = await getExamDatabase();
    return await db.get("completedAttempts", id);
  } catch (err) {
    console.error("Failed to retrieve completed attempt from IndexedDB:", err);
    return undefined;
  }
}

export async function getAllCompletedAttempts(): Promise<
  CompletedAttemptRecord[]
> {
  try {
    const db = await getExamDatabase();
    const records = await db.getAll("completedAttempts");
    // Return sorted newest first
    return records.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  } catch (err) {
    console.error("Failed to list completed attempts from IndexedDB:", err);
    return [];
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const db = await getExamDatabase();
    await db.clear("completedAttempts");
  } catch (err) {
    console.error("Failed to clear history from IndexedDB:", err);
  }
}
