export interface Note {
  id: number
  title: string
  content: string
  createdAt?: string | null
  updatedAt?: string | null
}


export interface CreateNotePayload {
  title: string
  content: string
}

export interface UpdateNotePayload {
  title: string
  content: string
}
