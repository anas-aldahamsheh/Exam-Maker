import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ExamAttempt, ExamResult } from "@/types/exam";

export interface CompletedAttemptRecord {
  id: string;
  attempt: ExamAttempt;
  result: ExamResult;
  completedAt: string;
}

interface ExamDB extends DBSchema {
  activeAttempts: {
    key: string;
    value: ExamAttempt;
    indexes: { "by-created": string };
  };
  completedAttempts: {
    key: string;
    value: CompletedAttemptRecord;
    indexes: {
      "by-completed": string;
      "by-role": string;
      "by-score": number;
    };
  };
  preferences: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = "ai_interview_exam_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ExamDB>> | null = null;

export function getExamDatabase(): Promise<IDBPDatabase<ExamDB>> {
  if (typeof window === "undefined") {
    // In SSR, return a mock or reject safely
    return Promise.reject(new Error("IndexedDB is only accessible in the browser"));
  }

  if (!dbPromise) {
    dbPromise = openDB<ExamDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Active attempts store
        if (!db.objectStoreNames.contains("activeAttempts")) {
          const activeStore = db.createObjectStore("activeAttempts", {
            keyPath: "id",
          });
          activeStore.createIndex("by-created", "createdAt");
        }

        // Completed history store
        if (!db.objectStoreNames.contains("completedAttempts")) {
          const completedStore = db.createObjectStore("completedAttempts", {
            keyPath: "id",
          });
          completedStore.createIndex("by-completed", "completedAt");
          completedStore.createIndex("by-role", "attempt.setup.jobTitle");
          completedStore.createIndex("by-score", "result.totalScore");
        }

        // Preferences store
        if (!db.objectStoreNames.contains("preferences")) {
          db.createObjectStore("preferences");
        }
      },
    });
  }

  return dbPromise;
}
