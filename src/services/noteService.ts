import { apiClient } from '@/lib/apiClient'
import type { CreateNotePayload, Note, UpdateNotePayload } from '@/types/note'

// ---------------------------------------------------------------------------
// ⚠️  ENDPOINT CONFIGURATION — update these paths to match your Java routes.
//
// These are the assumed REST paths. Replace with actual paths once known.
// ---------------------------------------------------------------------------
const ENDPOINTS = {
  /** GET all notes / POST create note */
  createNote: '/notes/create',
  updateNote: (id: number) => `/notes/update/${id}`,
  getANote: '',
  getAllNotes: '',
  deleteANote: '',
  deleteAllNotes: ''
  /** GET, PUT, DELETE single note by id */
  note: (id: number) => `/notes/${id}`,
} as const

// ---------------------------------------------------------------------------
// Response mapping
//
// If your Java backend returns a different structure (e.g. `created_at` instead
// of `createdAt`, or a wrapper like `{ data: Note }`) transform it here so the
// rest of the UI never needs to know.
// ---------------------------------------------------------------------------

/** Map a raw backend object to the frontend Note shape. */
function mapNote(raw: Record<string, unknown>): Note {
  return {
    id: raw.id as number,
    title: raw.title as string,
    content: raw.content as string,
    // If your backend uses snake_case timestamps, also check raw.created_at:
    createdAt: (raw.createdAt ?? raw.created_at ?? null) as string | null,
    updatedAt: (raw.updatedAt ?? raw.updated_at ?? null) as string | null,
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/** Fetch every note from the backend. */
export async function getAllNotes(): Promise<Note[]> {
  const data = await apiClient.get<Record<string, unknown>[]>(ENDPOINTS.notes)
  // Guard: backend might return null/undefined on empty list
  if (!Array.isArray(data)) return []
  return data.map(mapNote)
}

/** Fetch a single note by its id. */
export async function getNoteById(id: number): Promise<Note> {
  const data = await apiClient.get<Record<string, unknown>>(ENDPOINTS.note(id))
  return mapNote(data)
}

/** Create a new note and return the created entity. */
export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const data = await apiClient.post<Record<string, unknown>>(ENDPOINTS.notes, payload)
  return mapNote(data)
}

/**
 * Update an existing note and return the updated entity.
 *
 * ⚠️  ASSUMPTION: backend uses PUT (full replacement).
 * Change apiClient.put → apiClient.patch if your endpoint is PATCH.
 */
export async function updateNote(id: number, payload: UpdateNotePayload): Promise<Note> {
  const data = await apiClient.put<Record<string, unknown>>(ENDPOINTS.note(id), payload)
  return mapNote(data)
}

/** Delete a single note by id. */
export async function deleteNote(id: number): Promise<void> {
  await apiClient.delete<void>(ENDPOINTS.note(id))
}

/**
 * Delete all notes.
 *
 * ⚠️  ASSUMPTION: DELETE /notes deletes everything.
 * Adjust the endpoint if your backend uses a different route.
 */
export async function deleteAllNotes(): Promise<void> {
  await apiClient.delete<void>(ENDPOINTS.notes)
}
