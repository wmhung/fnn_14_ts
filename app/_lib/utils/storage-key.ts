const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(MIME_EXT);
export const ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(',');

// Place photos go browser → Storage directly, so only the bucket limit applies.
export const MAX_PLACE_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
// Avatars ride inside a Server Action's FormData → also bound by bodySizeLimit.
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

export const MAX_PLACE_IMAGE_LABEL = '5 MB';
export const MAX_AVATAR_LABEL = '2 MB';

function randomId(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === 'function') return c.randomUUID();
  return `${Math.random().toString(36).slice(2, 10)}${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/**
 * Storage-safe object key. Null when the MIME type isn't accepted, so the
 * caller can phrase its own message. Extension comes from the validated MIME
 * type, never from file.name — a filename's extension is user input and lies.
 */
export function buildStorageKey(mimeType: string): string | null {
  const ext = MIME_EXT[mimeType];
  if (!ext) return null;
  return `${Date.now()}-${randomId()}.${ext}`; // ASCII by construction
}

/** Human-readable rejection reason, or null when the file is fine. */
export function validateImage(file: File, maxBytes: number): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Image must be a PNG or JPEG file.';
  }
  if (file.size > maxBytes) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `Image is ${mb} MB — the limit is ${(maxBytes / 1024 / 1024).toFixed(0)} MB.`;
  }
  return null;
}
