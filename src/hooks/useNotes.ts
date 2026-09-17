import { useCallback, useEffect, useReducer } from 'react'
import {
  createNote,
  deleteAllNotes,
  deleteNote,
  getAllNotes,
  updateNote,
} from '@/services/noteService'
import type { CreateNotePayload, Note, UpdateNotePayload } from '@/types/note'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export interface NotesState {
  notes: Note[]
  fetchStatus: ApiStatus
  fetchError: string | null
  mutating: boolean       // true while any create/update/delete is in-flight
  mutationError: string | null
}

const initialState: NotesState = {
  notes: [],
  fetchStatus: 'idle',
  fetchError: null,
  mutating: false,
  mutationError: null,
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Note[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'MUTATE_START' }
  | { type: 'MUTATE_ERROR'; payload: string }
  | { type: 'NOTE_CREATED'; payload: Note }
  | { type: 'NOTE_UPDATED'; payload: Note }
  | { type: 'NOTE_DELETED'; payload: string }
  | { type: 'ALL_DELETED' }
  | { type: 'CLEAR_MUTATION_ERROR' }

function reducer(state: NotesState, action: Action): NotesState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, fetchStatus: 'loading', fetchError: null }
    case 'FETCH_SUCCESS':
      return { ...state, fetchStatus: 'success', notes: action.payload, fetchError: null }
    case 'FETCH_ERROR':
      return { ...state, fetchStatus: 'error', fetchError: action.payload }
    case 'MUTATE_START':
      return { ...state, mutating: true, mutationError: null }
    case 'MUTATE_ERROR':
      return { ...state, mutating: false, mutationError: action.payload }
    case 'NOTE_CREATED':
      return { ...state, mutating: false, notes: [action.payload, ...state.notes] }
    case 'NOTE_UPDATED':
      return {
        ...state,
        mutating: false,
        notes: state.notes.map(n => (n.id === action.payload.id ? action.payload : n)),
      }
    case 'NOTE_DELETED':
      return {
        ...state,
        mutating: false,
        notes: state.notes.filter(n => n.id !== action.payload),
      }
    case 'ALL_DELETED':
      return { ...state, mutating: false, notes: [] }
    case 'CLEAR_MUTATION_ERROR':
      return { ...state, mutationError: null }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseNotesReturn extends NotesState {
  refresh: () => Promise<void>
  create: (payload: CreateNotePayload) => Promise<Note | null>
  update: (id: string, payload: UpdateNotePayload) => Promise<Note | null>
  remove: (id: string) => Promise<boolean>
  removeAll: () => Promise<boolean>
  clearMutationError: () => void
}

export function useNotes(): UseNotesReturn {
  const [state, dispatch] = useReducer(reducer, initialState)

  const refresh = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const notes = await getAllNotes()
      dispatch({ type: 'FETCH_SUCCESS', payload: notes })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notes'
      dispatch({ type: 'FETCH_ERROR', payload: message })
    }
  }, [])

  // Initial load
  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(async (payload: CreateNotePayload): Promise<Note | null> => {
    dispatch({ type: 'MUTATE_START' })
    try {
      const note = await createNote(payload)
      dispatch({ type: 'NOTE_CREATED', payload: note })
      return note
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note'
      dispatch({ type: 'MUTATE_ERROR', payload: message })
      return null
    }
  }, [])

  const update = useCallback(
    async (id: number, payload: UpdateNotePayload): Promise<Note | null> => {
      dispatch({ type: 'MUTATE_START' })
      try {
        const note = await updateNote(id, payload)
        dispatch({ type: 'NOTE_UPDATED', payload: note })
        return note
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update note'
        dispatch({ type: 'MUTATE_ERROR', payload: message })
        return null
      }
    },
    [],
  )

  const remove = useCallback(async (id: number): Promise<boolean> => {
    dispatch({ type: 'MUTATE_START' })
    try {
      await deleteNote(id)
      dispatch({ type: 'NOTE_DELETED', payload: id })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note'
      dispatch({ type: 'MUTATE_ERROR', payload: message })
      return false
    }
  }, [])

  const removeAll = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'MUTATE_START' })
    try {
      await deleteAllNotes()
      dispatch({ type: 'ALL_DELETED' })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete all notes'
      dispatch({ type: 'MUTATE_ERROR', payload: message })
      return false
    }
  }, [])

  const clearMutationError = useCallback(() => {
    dispatch({ type: 'CLEAR_MUTATION_ERROR' })
  }, [])

  return { ...state, refresh, create, update, remove, removeAll, clearMutationError }
}
