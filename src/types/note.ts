// ---------------------------------------------------------------------------
// NOTE: This is a TEMPORARY model based on reasonable assumptions.
// Replace these types to exactly match your Java backend DTO/entity once
// you share the actual response structure.
// ---------------------------------------------------------------------------

/**
 * Represents a single note as returned by the Java backend.
 *
 * ⚠️  ASSUMPTIONS (update when you share the real backend contract):
 *   - `id`         — assumed numeric (Long in Java). Change to `string` if UUID.
 *   - `title`      — plain string, required.
 *   - `content`    — plain string, required.
 *   - `createdAt`  — ISO-8601 string (e.g. "2024-05-01T10:00:00Z"). Nullable.
 *   - `updatedAt`  — ISO-8601 string. Nullable.
 *
 * All fields outside this list that the backend returns are captured in the
 * index signature so they are not silently dropped, but the UI only uses the
 * typed fields above.
 */
export interface Note {
  id: number
  title: string
  content: string
  createdAt?: string | null
  updatedAt?: string | null
}

/**
 * Payload sent to the backend when creating a new note.
 *
 * ⚠️  ASSUMPTION: body is `{ title, content }`.
 * Update `CreateNotePayload` if your Java endpoint expects a different shape
 * (e.g. snake_case, additional required fields, nested objects).
 */
export interface CreateNotePayload {
  title: string
  content: string
}

/**
 * Payload sent to the backend when updating an existing note.
 *
 * ⚠️  ASSUMPTION: same shape as creation (full replacement, not a PATCH).
 * Change to `Partial<CreateNotePayload>` if your endpoint accepts partial updates.
 */
export interface UpdateNotePayload {
  title: string
  content: string
}
