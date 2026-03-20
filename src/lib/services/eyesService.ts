/**
 * Eyes service (placeholder)
 *
 * This module provides a minimal, in-memory scaffolding for registering cameras,
 * listing them, and a stub for ingesting frames. It's intentionally lightweight:
 * - It does NOT persist data (use a DB or durable store in production).
 * - It does NOT store credentials (use a secrets manager).
 * - Ingest is a NO-OP placeholder so you can wire workers / inference pipelines later.
 *
 * Responsibilities you will likely add in production:
 * - Camera registry persisted to DB with secure credential references.
 * - Worker(s) that pull from RTSP / push-based webhooks, persist frames, and run models.
 * - Event routing into the FlowService / alerting system when detections occur.
 * - IAM / RLS to control who can register/list cameras.
 */

export type CameraDescriptor = {
  id: string; // unique identifier
  name?: string;
  endpoint: string; // RTSP URL or webhook base URL
  description?: string;
  // credentialsRef should be a reference to a secret stored in a secure vault.
  // Do not store cleartext credentials here.
  credentialsRef?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Internal in-memory registry for cameras.
 * Replace with DB persistence for production use.
 */
const cameras = new Map<string, CameraDescriptor>();

/**
 * Register or update a camera descriptor.
 * Throws on invalid input.
 */
export function registerCamera(cam: CameraDescriptor) {
  if (!cam || typeof cam !== "object")
    throw new Error("camera object required");
  if (!cam.id || typeof cam.id !== "string")
    throw new Error("camera id required");
  if (!cam.endpoint || typeof cam.endpoint !== "string")
    throw new Error("camera endpoint required");

  const now = new Date().toISOString();
  const existing = cameras.get(cam.id);
  const descriptor: CameraDescriptor = {
    ...cam,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  cameras.set(cam.id, descriptor);
  return descriptor;
}

/**
 * Remove a camera by id. Returns true if removed, false if not found.
 */
export function unregisterCamera(id: string) {
  return cameras.delete(id);
}

/**
 * List registered cameras.
 */
export function listCameras(): CameraDescriptor[] {
  return Array.from(cameras.values());
}

/**
 * Get a specific camera descriptor.
 */
export function getCamera(id: string): CameraDescriptor | undefined {
  return cameras.get(id);
}

/**
 * Placeholder ingestFrame API.
 *
 * In production this should:
 * - Persist the frame (or a reference to it) in object storage / DB.
 * - Publish an event to a processing queue for model inference.
 * - Return an ingestion id or metadata for tracking.
 *
 * Here we accept a Buffer (Node) or Uint8Array and return a minimal ack.
 */
export async function ingestFrame(
  cameraId: string,
  frameBuffer: Buffer | Uint8Array,
) {
  if (!cameraId) throw new Error("cameraId required");

  // Detect Buffer/Uint8Array in a runtime-safe way. `Buffer` may not exist in
  // some runtime environments (e.g. browser), so prefer Buffer.isBuffer when
  // available instead of using `instanceof Buffer` directly.
  const isUint8 = frameBuffer instanceof Uint8Array;
  const isBuffer =
    typeof Buffer !== "undefined" &&
    typeof (Buffer as any).isBuffer === "function" &&
    (Buffer as any).isBuffer(frameBuffer as any);

  if (!frameBuffer || (!isUint8 && !isBuffer)) {
    throw new Error("frameBuffer must be a Buffer or Uint8Array");
  }

  const cam = cameras.get(cameraId);
  if (!cam) throw new Error("camera not registered");

  // NO-OP placeholder: in future implement persistence + inference pipeline
  const ingestionRecord = {
    id: `ingest_${cameraId}_${Date.now()}`,
    cameraId,
    sizeBytes:
      (frameBuffer as Buffer).byteLength ?? (frameBuffer as Uint8Array).length,
    ingestedAt: new Date().toISOString(),
  };

  // In a real implementation, you might:
  // - store frame to S3/GCS and save a DB row
  // - push a job to a queue such as Bull/Sidekiq/Kafka
  // - kick off a model inference job and attach callbacks/webhooks
  return ingestionRecord;
}

/**
 * Lightweight health check helper for cameras.
 * For RTSP endpoints you'd attempt a short connect (not implemented here).
 */
export async function pingCamera(
  cameraId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const cam = cameras.get(cameraId);
  if (!cam) return { ok: false, reason: "not registered" };

  // Placeholder: do not attempt network operations here.
  // Implement specific ping logic for RTSP or HTTP cameras in production.
  return { ok: true };
}

/**
 * Default export with the service surface.
 */
const eyesService = {
  registerCamera,
  unregisterCamera,
  listCameras,
  getCamera,
  ingestFrame,
  pingCamera,
};

export default eyesService;
