import { promises as fs } from "fs";
import path from "path";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const resolveBaseDir = () => path.join(process.cwd(), "tmp", "guest-ids");
const resolveKeyPath = () => path.join(resolveBaseDir(), "guest-id.key");

const ensureBaseDir = async () => {
  const dir = resolveBaseDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

const getKey = async () => {
  if (process.env.GUEST_ID_ENCRYPTION_KEY) {
    return Buffer.from(process.env.GUEST_ID_ENCRYPTION_KEY, "base64");
  }
  const keyPath = resolveKeyPath();
  try {
    const existing = await fs.readFile(keyPath);
    if (existing.length === 32) return existing;
  } catch {}
  const key = randomBytes(32);
  await ensureBaseDir();
  await fs.writeFile(keyPath, key);
  return key;
};

const packPayload = (mimeType: string, data: Buffer) => {
  const mimeBuffer = Buffer.from(mimeType || "image/jpeg");
  const lengthBuffer = Buffer.alloc(2);
  lengthBuffer.writeUInt16BE(mimeBuffer.length, 0);
  return Buffer.concat([lengthBuffer, mimeBuffer, data]);
};

const unpackPayload = (payload: Buffer) => {
  const mimeLength = payload.readUInt16BE(0);
  const mimeType = payload.subarray(2, 2 + mimeLength).toString("utf8");
  const data = payload.subarray(2 + mimeLength);
  return { mimeType, data };
};

export const saveEncryptedImage = async (buffer: Buffer, mimeType: string, filename: string) => {
  const key = await getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const payload = packPayload(mimeType, buffer);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();
  const content = Buffer.concat([iv, tag, encrypted]);
  const dir = await ensureBaseDir();
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, content);
  return filePath;
};

export const readEncryptedImage = async (filePath: string) => {
  const key = await getKey();
  const file = await fs.readFile(filePath);
  const iv = file.subarray(0, 12);
  const tag = file.subarray(12, 28);
  const encrypted = file.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const payload = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return unpackPayload(payload);
};
