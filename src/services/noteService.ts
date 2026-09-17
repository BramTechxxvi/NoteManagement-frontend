import { apiClient } from '@/lib/apiClient'
import type { CreateNotePayload, Note, UpdateNotePayload } from '@/types/note'



const ENDPOINTS = {
  createNote: `/notes/create`,
  updateNote: (id: number) => `/notes/update/${id}`,
  getANote: (id: number)=> `notes/getANote/${id}`,
  getAllNotes: `notes/getAllNotes`,
  deleteANote: (id: number)=> `notes/delete/${id}`,
  deleteAllNotes: `notes/deleteAllNotes`
} as const


function mapNote(raw: Record<string, unknown>): Note {
  return {
    id: raw.id as number,
    title: raw.title as string,
    content: raw.content as string,
    createdAt: (raw.createdAt ?? raw.created_at ?? null) as string | null,
    updatedAt: (raw.updatedAt ?? raw.updated_at ?? null) as string | null,
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function getAllNotes(): Promise<Note[]> {
  const data = await apiClient.get<Record<string, unknown>[]>(ENDPOINTS.getAllNotes)
  // Guard: backend might return null/undefined on empty list
  if (!Array.isArray(data)) return []
  return data.map(mapNote)
}


export async function getNoteById(id: number): Promise<Note> {
  const data = await apiClient.get<Record<string, unknown>>(ENDPOINTS.getANote(id))
  return mapNote(data)
}


export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const data = await apiClient.post<Record<string, unknown>>(ENDPOINTS.createNote, payload)
  return mapNote(data)
}


export async function updateNote(id: number, payload: UpdateNotePayload): Promise<Note> {
  const data = await apiClient.put<Record<string, unknown>>(ENDPOINTS.updateNote(id), payload)
  return mapNote(data)
}


export async function deleteNote(id: number): Promise<void> {
  await apiClient.delete<void>(ENDPOINTS.deleteANote(id))
}


export async function deleteAllNotes(): Promise<void> {
  await apiClient.delete<void>(ENDPOINTS.deleteAllNotes)
}
