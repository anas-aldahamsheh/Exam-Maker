import crypto from "node:crypto";
import { env } from "@/lib/config/env";
import { SealedAnswerKeyPayload } from "@/types/exam";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM

function getSecretKey(): Buffer {
  const secret = env.EXAM_SEAL_SECRET || "default-secret-exam-simulator-development-key-32-chars";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Seals the answer keys and rubrics into a tamper-proof AES-256-GCM token.
 * Can only be decrypted by the server.
 */
export function sealAnswerKey(payload: SealedAnswerKeyPayload): string {
  const key = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(json, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all hex)
  const combined = `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
  return Buffer.from(combined, "utf8").toString("base64url");
}

/**
 * Unseals and validates the encrypted answer key payload.
 * Throws if the token was tampered with, expired, or corrupted.
 */
export function unsealAnswerKey(token: string): SealedAnswerKeyPayload {
  try {
    const key = getSecretKey();
    const combined = Buffer.from(token, "base64url").toString("utf8");
    const [ivHex, authTagHex, encryptedHex] = combined.split(":");

    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error("Invalid sealed token structure");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    const payload = JSON.parse(decrypted.toString("utf8")) as SealedAnswerKeyPayload;
    return payload;
  } catch (err: unknown) {
    throw new Error(`Failed to unseal answer key: ${(err as Error).message}`);
  }
}
